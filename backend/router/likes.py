from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from auth import main
from database import get_db
from likes import crud, schemas
from stories.crud import get_story
from stories import schemas as stories_schemas

router = APIRouter()


@router.post("/", response_model=schemas.Like)
async def create_like(
    like: schemas.LikeCreate,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    if not get_story(db, like.story_id):
        raise HTTPException(
            status_code=404,
            detail="Target story cannot be found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not current_story:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User haven't shared their story",
            headers={"WWW-Authenticate": "Bearer"},
        )

    like_to_update = crud.get_like_by_story_and_user(
        db, story_id=like.story_id, liker_story_id=current_story.id
    )

    if like_to_update:
        return crud.update_like(db, like_to_update.id, like)
    else:
        if like.story_id == current_story.id:
            raise HTTPException(
                status_code=422,
                detail="User cannot like or dislike their own stories",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return crud.create_like(db, like, current_story.id)


@router.get("/{story_id}")
async def get_like_count(
    story_id: int,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    like_count = crud.get_like_count(db, story_id)
    dislike_count = crud.get_dislike_count(db, story_id)
    is_like_by_me = crud.is_like_by(db, story_id, current_story.id)

    return JSONResponse(
        {
            "like": like_count,
            "dislike": dislike_count,
            "like_by_me": is_like_by_me,
        },
        status_code=200,
    )
