from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy.sql.expression import and_
from stories.crud import update


def get_like_by_story_and_user(
    db: Session, story_id: int, liker_story_id: int
):
    return (
        db.query(models.Like)
        .filter(
            and_(
                models.Like.story_id == story_id,
                models.Like.liker_story_id == liker_story_id,
            )
        )
        .first()
    )


def update_like(db, like_id, like: schemas.LikeCreate):
    return update(like_id, like, models.Like, db)


def create_like(db, like: schemas.LikeCreate, liker_story_id: int):
    d = like.dict()
    d["liker_story_id"] = liker_story_id
    db_like = models.Like(**d)
    db.add(db_like)
    db.commit()
    db.refresh(db_like)
    return db_like


def get_like_count(db, story_id):
    return (
        db.query(models.Like)
        .filter(and_(models.Like.story_id == story_id, models.Like.like == 1))
        .count()
    )


def get_dislike_count(db, story_id):
    return (
        db.query(models.Like)
        .filter(and_(models.Like.story_id == story_id, models.Like.like == 0))
        .count()
    )


def is_like_by(db, story_id, liker_story_id):
    db_like = get_like_by_story_and_user(db, story_id, liker_story_id)
    if db_like:
        return db_like.like
    else:
        return None
