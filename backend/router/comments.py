from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from auth import main
from stories import schemas as stories_schemas
from database import get_db
from comments import crud, schemas
from router.stories import check_permissions

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
def get_comments_by_my_story(
    my_story_id: int,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    comments = crud.get_comments_by_my_story(db, my_story_id)
    if current_story:
        for comment in comments:
            db_spam = crud.get_spam_by_comment_and_user(
                db, comment.id, current_story.id
            )
            if db_spam:
                comment.reported = db_spam.spam

    return comments


@router.post("/{comment_id}", response_model=schemas.Comment)
def update_comment(
    comment_id: int,
    comment: schemas.CommentUpdate,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    db_comment = crud.get_comment(db, comment_id)
    check_permissions(current_story, db_comment.story_id)
    return crud.update_comment(db, comment_id, comment)


@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    db_comment = crud.get_comment(db, comment_id)
    check_permissions(current_story, db_comment.story_id)
    crud.delete_comment(db, comment_id)


@router.get("/{comment_id}", response_model=schemas.Comment)
def get_comment(
    comment_id: int, db: Session = Depends(get_db),
):
    return crud.get_comment(db, comment_id)


@router.post("/{comment_id}/like", response_model=schemas.CommentLike)
def like_comment(
    comment_id: int,
    dto: schemas.CommentLikeCreate,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    if not current_story:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User must first share their story before "
            + "they can like or dislike a comment",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return crud.like_comment(db, comment_id, current_story.id, dto.like)


@router.get("/{comment_id}/like")
def count_like(
    comment_id: int,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    d = crud.count_like(db, comment_id)
    db_like = (
        crud.get_like_by_comment_and_user(db, comment_id, current_story.id)
        if current_story
        else None
    )

    like_by_me = db_like.like if db_like else None
    d["like_by_me"] = like_by_me

    return JSONResponse(d, status_code=200,)


@router.post("/{comment_id}/report", response_model=schemas.CommentLike)
def report_comment(
    comment_id: int,
    dto: schemas.CommentSpamCreate,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    if not current_story:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User must first share their story before "
            + "reporting a comment",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return crud.report_comment(db, comment_id, current_story.id, dto.spam)
