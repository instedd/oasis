from typing import List

from fastapi import Depends, FastAPI, APIRouter, HTTPException
from sqlalchemy.orm import Session

from stories import crud, models, schemas
from database.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Story)
def create_user(story: schemas.CreateStory, db: Session = Depends(get_db)):
    return crud.create_story(db=db, story=story)

@router.get("/")
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # users = crud.get_stories(db, skip=skip, limit=limit)
    return "You shall not see all stories"

@router.get("/{story_id}", response_model=schemas.Story)
def read_user(story_id: int, db: Session = Depends(get_db)):
    story = crud.get_story(db, story_id=story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="User not found")
    return story
