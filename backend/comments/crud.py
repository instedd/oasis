from sqlalchemy.orm import Session
from . import models, schemas
from stories.crud import update


def create_comment(db: Session, comment: schemas.CommentCreate):
    db_comment = models.Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    return db_comment


def get_comments_by_my_story(db: Session, my_story_id):
    return (
        db.query(models.Comment)
        .filter(models.Comment.my_story_id == my_story_id)
        .all()
    )


def update_comment(db: Session, comment_id, comment: schemas.CommentUpdate):
    return update(comment_id, comment, models.Comment, db)


def delete_comment(db: Session, comment_id):
    db.query(models.Comment).filter(models.Comment.id == comment_id).delete()
    db.commit()


def get_comment(db: Session, comment_id):
    db_comment = (
        db.query(models.Comment)
        .filter(models.Comment.id == comment_id)
        .first()
    )

    return db_comment
