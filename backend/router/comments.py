from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import main
from stories import schemas as stories_schemas
from database import get_db
from comments import crud, schemas

router = APIRouter()


@router.post("/my_stories/{my_story_id}", response_model=schemas.Comment)
def create_comment(
    my_story_id: int,
    comment: schemas.CommentBase,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    if not current_story:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User must first share their story before commenting",
            headers={"WWW-Authenticate": "Bearer"},
        )

    story_id = current_story.id
    comment = schemas.CommentCreate(
        story_id=story_id, my_story_id=my_story_id, **comment.dict()
    )
    comment.story_id = story_id
    comment.my_story_id = my_story_id

    return crud.create_comment(db, comment)


@router.get("/my_stories/{my_story_id}", response_model=List[schemas.Comment])
def get_comments_by_my_story(my_story_id: int, db: Session = Depends(get_db)):
    return crud.get_comments_by_my_story(db, my_story_id)


@router.post("/{comment_id}", response_model=schemas.Comment)
def update_comment(
    comment_id: int,
    comment: schemas.CommentUpdate,
    db: Session = Depends(get_db),
):
    return crud.update_comment(db, comment_id, comment)


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int, db: Session = Depends(get_db),
):
    crud.delete_comment(db, comment_id)


@router.get("/{comment_id}", response_model=schemas.Comment)
def get_comment(
    comment_id: int, db: Session = Depends(get_db),
):
    return crud.get_comment(db, comment_id)
