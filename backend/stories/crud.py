from typing import List

from sqlalchemy.orm import Session

from users.models import User
from . import models, schemas


def get_story(db: Session, story_id: int):
    db_story = (
        db.query(models.Story).filter(models.Story.id == story_id).first()
    )
    return db_story


def update_story(db: Session, story_id: int, story: schemas.StoryCreate):
    story_as_dict = dict(story)
    db_story = (
        db.query(models.Story).filter(models.Story.id == story_id).first()
    )
    for k, v in story_as_dict.items():
        setattr(db_story, k, v)
    db.commit()
    return db_story


def create_story(db: Session, story: schemas.StoryCreate, user):
    db_story = models.Story(**story.dict())
    db.add(db_story)
    db.commit()
    db.refresh(db_story)

    # if the story was submitted with an auth token,
    # we want to associate it to the token's user
    if user and not user.story:
        db.query(User).filter(User.id == user.id).update(
            {"story_id": db_story.id}
        )
        db.commit()
        db.refresh(db_story)

    return db_story


def get_symptoms(db: Session):
    return db.query(models.Symptom).all()


def create_story_symptoms(
    db: Session, symptoms: List[schemas.StorySymptomCreate]
):
    db_symptoms = [
        models.StorySymptom(**symptom.dict()) for symptom in symptoms
    ]
    db.add_all(db_symptoms)
    db.commit()
    return db_symptoms
