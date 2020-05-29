from typing import List

from fastapi import Depends, FastAPI, APIRouter, HTTPException, Header, status
from sqlalchemy.orm import Session
from database import get_db
from auth import main
from stories import crud, models, schemas

router = APIRouter()

def check_permissions(current_story, story_id):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/", response_model=schemas.Story)
async def create_story(story: schemas.StoryCreate, db: Session = Depends(get_db), authorization: str = Header(None)):
    token_data = await main.get_token_contents(authorization[7:]) if authorization is not None else None
    return crud.create_story(db=db, story=story, token_data=token_data)


@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, current_story: schemas.Story = Depends(main.get_current_story)):
    check_permissions(current_story, story_id)
    return current_story


@router.get("/{story_id}/symptoms", response_model=List[schemas.Symptom])
def read_story_symptoms(story_id: int, current_story: schemas.Story = Depends(main.get_current_story), db: Session = Depends(get_db)):
    check_permissions(current_story, story_id)
    return crud.get_story_symptoms(db, story_id=story_id)
