from fastapi import Depends, FastAPI, APIRouter, HTTPException, Header, status
from sqlalchemy.orm import Session

from stories import crud, models, schemas
from database.database import get_db
from auth import main

router = APIRouter()


@router.post("/", response_model=schemas.Story)
async def create_story(story: schemas.CreateStory, db: Session = Depends(get_db), authorization: str = Header(None)):
    token_data = await main.get_token_data(authorization[7:]) if authorization is not None else None
    return crud.create_story(db=db, story=story, token_data=token_data)

@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, current_story: schemas.Story = Depends(main.get_current_story)):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_story
