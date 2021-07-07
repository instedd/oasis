from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import and_

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


def get_like_by_comment_and_user(db: Session, comment_id, story_id):
    return (
        db.query(models.CommentLike)
        .filter(
            and_(
                models.CommentLike.comment_id == comment_id,
                models.CommentLike.story_id == story_id,
            )
        )
        .first()
    )


def like_comment(db: Session, comment_id, story_id, is_like):
    like = schemas.CommentLike(
        like=is_like, comment_id=comment_id, story_id=story_id
    )

    db_like = get_like_by_comment_and_user(db, comment_id, story_id)
    if db_like:
        update(db_like.id, like, models.CommentLike, db)
    else:
        db_like = models.CommentLike(**like.dict())
        db.add(db_like)
        db.commit()

    db.refresh(db_like)
    return db_like


def count_like(db: Session, comment_id):
    like = (
        db.query(models.CommentLike)
        .filter(
            and_(
                models.CommentLike.comment_id == comment_id,
                models.CommentLike.like == 1,
            )
        )
        .count()
    )

    dislike = (
        db.query(models.CommentLike)
        .filter(
            and_(
                models.CommentLike.comment_id == comment_id,
                models.CommentLike.like == 0,
            )
        )
        .count()
    )

    return {"like": like, "dislike": dislike}


def get_spam_by_comment_and_user(db, comment_id, story_id):
    return (
        db.query(models.CommentSpam)
        .filter(
            and_(
                models.CommentSpam.comment_id == comment_id,
                models.CommentSpam.story_id == story_id,
            )
        )
        .first()
    )


def report_comment(db: Session, comment_id, story_id, is_spam):
    spam = schemas.CommentSpam(
        spam=is_spam, comment_id=comment_id, story_id=story_id
    )
    db_spam = get_spam_by_comment_and_user(db, comment_id, story_id)

    if db_spam:
        update(db_spam.id, spam, models.CommentSpam, db)
    else:
        db_spam = models.CommentSpam(**spam.dict())
        db.add(db_spam)
        db.commit()

    db.refresh(db_spam)
    return db_spam
