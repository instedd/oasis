from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from auth import main
from database import get_db
from likes import crud, schemas
from stories.crud import get_my_story
from stories import schemas as stories_schemas

router = APIRouter()


@router.post("/", response_model=schemas.Like)
def create_like(
    like: schemas.LikeCreate,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    my_story = get_my_story(db, like.my_story_id)
    if not my_story:
        raise HTTPException(
            status_code=404,
            detail="Target my story cannot be found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not current_story:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User haven't shared their story",
            headers={"WWW-Authenticate": "Bearer"},
        )

    like_to_update = crud.get_like_by_story_and_user(
        db, my_story_id=like.my_story_id, liker_story_id=current_story.id
    )

    if like_to_update:
        db_like = crud.update_like(db, like_to_update.id, like)
    else:
        if my_story.story_id == current_story.id:
            raise HTTPException(
                status_code=422,
                detail="User cannot like or dislike their own my stories",
                headers={"WWW-Authenticate": "Bearer"},
            )

        db_like = crud.create_like(db, like, current_story.id)

    return db_like


@router.get("/{my_story_id}")
def get_like_count(
    my_story_id: int,
    current_story: stories_schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    like_count = crud.get_like_count(db, my_story_id)
    dislike_count = crud.get_dislike_count(db, my_story_id)
    is_like_by_me = crud.is_like_by(db, my_story_id, current_story.id)

    return JSONResponse(
        {
            "like": like_count,
            "dislike": dislike_count,
            "like_by_me": is_like_by_me,
        },
        status_code=200,
    )
