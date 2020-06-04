from typing import List
import os

from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from starlette.requests import Request

from database import get_db
from auth import main, schemas as auth_schemas
from users.crud import get_user_by_email
from stories import crud, schemas


router = APIRouter()


def check_permissions(current_story, story_id):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/", response_model=schemas.Story)
def read_story(current_story: schemas.Story = Depends(main.get_current_story)):
    return current_story


@router.post("/", response_model=schemas.Story)
async def create_story(
    story: schemas.StoryCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    token_data = await main.get_token_if_present(request)
    story_to_update = None
    user = None
    if token_data:
        # if there was token data associated with the request,
        # we probably wanted to do an update
        if isinstance(token_data, auth_schemas.UserToken):
            user = get_user_by_email(db, email=token_data.email)
            if user.story:
                story_to_update = user.story.id
        else:
            story_to_update = token_data.story_id
    if story_to_update:
        db_story = crud.update_story(db, story_to_update, story)
    else:
        db_story = crud.create_story(db=db, story=story, user=user)

    # prepare response
    response = JSONResponse(
        schemas.Story.from_orm(db_story).dict(), status_code=200
    )
    if not token_data:
        access_token = main.create_access_token(data={"story_id": db_story.id})
        response.set_cookie(
            "Authorization",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=os.environ["COOKIE_EXPIRATION_SECONDS"],
            expires=os.environ["COOKIE_EXPIRATION_SECONDS"],
        )
    return response


@router.get("/{story_id}/symptoms", response_model=List[schemas.Symptom])
def read_story_symptoms(
    story_id: int,
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return current_story.symptoms


@router.post("/{story_id}/symptoms", response_model=List[schemas.StorySymptom])
def create_story_symptoms(
    story_id: int,
    symptoms: List[schemas.StorySymptomCreate],
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return crud.create_story_symptoms(db, symptoms=symptoms)
