from fastapi import Depends, FastAPI, APIRouter, HTTPException, Header
from sqlalchemy.orm import Session
from stories import crud, models, schemas
from users.crud import get_token_data
from database.database import get_db
from typing import List

router = APIRouter()

@router.post("/", response_model=schemas.Story)
async def create_story(story: schemas.CreateStory, db: Session = Depends(get_db), authorization: str = Header(None)):
    token_data = await get_token_data(authorization[7:]) if authorization is not None else None
    return crud.create_story(db=db, story=story, token_data=token_data)

@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, db: Session = Depends(get_db)):
    story = crud.get_story(db, story_id=story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return story
