from typing import List
from datetime import timedelta

from fastapi import Depends, APIRouter, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.security.utils import get_authorization_scheme_param
from starlette.requests import Request

from database import get_db
from auth import main
from stories import crud, schemas

router = APIRouter()


def check_permissions(current_story, story_id):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/", response_model=schemas.Story)
async def create_story(
    story: schemas.StoryCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    cookie_authorization: str = request.cookies.get("Authorization")
    cookie_scheme, cookie_param = get_authorization_scheme_param(
        cookie_authorization
    )
    token_data = (
        await main.get_token_contents(cookie_param)
        if cookie_authorization and cookie_param
        else None
    )
    db_story = crud.create_story(db=db, story=story, token_data=token_data)
    response = JSONResponse(
        schemas.Story.from_orm(db_story).json(), status_code=200
    )
    if not cookie_authorization:
        access_token = main.create_access_token(
            data={"story_id": db_story.id}, expires_delta=timedelta(days=5)
        )
        response.set_cookie(
            "Authorization",
            value=f"Bearer {access_token}",
            httponly=True,
            max_age=1800,
            expires=1800,
        )
    return response


@router.get("/", response_model=schemas.Story)
def read_story(
    current_story: schemas.Story = Depends(main.get_current_story),
):
    return schemas.Story.from_orm(current_story)


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
