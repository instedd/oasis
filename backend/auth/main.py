import os
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import jwt
from database.database import get_db
from jwt import PyJWTError
from users import crud

from . import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth")


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({ "exp": expire })
    encoded_jwt = jwt.encode(to_encode, os.environ['JWT_SECRET'], algorithm='HS512')
    return encoded_jwt


async def get_token_contents(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS512'])  
        email: str = payload.get("email")
        story_id: str = payload.get("story_id")
        if email:
          return schemas.UserToken(email=email)
        if story_id:
          return schemas.StoryToken(story_id=story_id)
        if not (story_id or email):
          return None
    except PyJWTError:
        return None
    return token_data

credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    token_data = get_token_contents(token=token)
    if token_data is None:
        raise credentials_exception
    user = crud.get_user_by_email(get_db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


# demands that an endpoint has a token
# demands that the token is associated to an user that has a story, or a story
async def get_current_story(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = await get_token_contents(token=token)
    if token_data is None:
        raise credentials_exception
    user = get_user_by_email(db, email=token_data.email)
    story = get_story(db, story_id=token_data.story_id) if token_data.story_id else None
    if not story:
        if not (user and user.story): # no story nor user match the token data
            raise HTTPException(status_code=404, detail="Story not found")
        else: # there's a user with a story
            return schemas.Story.from_module(user.story)
    if not user: # the token has no user data, so we're operating anonymously. That's ok!
        return story
    elif user.story.id != story.id: # there's user data in the token but it doesn't match the story data
        raise credentials_exception
    # there's user data and it matches user data
    return story
