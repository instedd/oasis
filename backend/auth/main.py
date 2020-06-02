import os
from typing import Optional
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2
from sqlalchemy.orm import Session
from starlette.requests import Request
from fastapi.security.utils import get_authorization_scheme_param

import jwt
from database import get_db
from jwt import PyJWTError
from users.crud import get_user_by_email
from stories.crud import get_story
from stories import schemas as story_schemas
from . import schemas


class OAuth2PasswordBearerCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(
            password={"tokenUrl": tokenUrl, "scopes": scopes}
        )
        super().__init__(
            flows=flows, scheme_name=scheme_name, auto_error=auto_error
        )

    async def __call__(self, request: Request) -> Optional[str]:
        header_authorization: str = request.headers.get("Authorization")
        cookie_authorization: str = request.cookies.get("Authorization")

        header_scheme, header_param = get_authorization_scheme_param(
            header_authorization
        )
        cookie_scheme, cookie_param = get_authorization_scheme_param(
            cookie_authorization
        )

        if header_scheme.lower() == "bearer":
            authorization = True
            scheme = header_scheme
            param = header_param

        elif cookie_scheme.lower() == "bearer":
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        else:
            authorization = False

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authenticated",
                )
            else:
                return None
        return param


oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="api/auth")


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, os.environ["JWT_SECRET"], algorithm="HS512"
    )
    return encoded_jwt.decode("utf-8")


async def get_token_contents(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token, os.environ["JWT_SECRET"], algorithms=["HS512"]
        )
        email: str = payload.get("email")
        story_id: str = payload.get("story_id")
        print(f"email is {email}")
        print(f"story is {story_id}")
        if email:
            return schemas.UserToken(email=email)
        if story_id:
            return schemas.StoryToken(story_id=story_id)
    except PyJWTError:
        return None
    return None


credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    token_data = await get_token_contents(token=token)
    if token_data is None:
        raise credentials_exception
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


# demands that an endpoint has a token
# demands that the token is associated to an user that has a story, or a story
async def get_current_story(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    print(f"token is {token}")
    token_data = await get_token_contents(token=token)
    print(f"token data is {token_data}")
    if token_data is None:
        raise credentials_exception
    user = None
    story = None
    if isinstance(token_data, schemas.UserToken):
        user = get_user_by_email(db, email=token_data.email)
    if isinstance(token_data, schemas.StoryToken):
        story = (
            get_story(db, story_id=token_data.story_id)
            if token_data.story_id
            else None
        )
    if not story:
        if not (user and user.story):  # no story nor user match the token data
            raise HTTPException(status_code=404, detail="Story not found")
        else:  # there's a user with a story
            return story_schemas.Story.from_orm(user.story)
    if (
        not user
    ):  # the token has no user data, so we're operating anonymously. That's ok
        return story
    elif (
        user.story.id != story.id
    ):  # there's user data in the token but it doesn't match the story data
        raise credentials_exception
    # there's user data and it matches user data
    return story
