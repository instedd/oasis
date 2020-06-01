import json
from typing import List
from datetime import timedelta

from sqlalchemy.orm import Session

from auth import main
from auth.schemas import UserToken
from users.crud import get_user_by_email
from users.models import User

from . import models, schemas


def get_story(db: Session, story_id: int):
    db_story = (
        db.query(models.Story).filter(models.Story.id == story_id).first()
    )
    return db_story


def update_story(db: Session, story_id: int, story: schemas.StoryCreate):
    story_as_dict = dict(story)
    story_data = {
        k: story_as_dict[k]
        for k in story_as_dict
        if k in models.Story.__table__.columns
    }
    db.query(models.Story).filter(models.Story.id == story_id).update(
        story_data
    )
    db_story = (
        db.query(models.Story).filter(models.Story.id == story_id).first()
    )
    return db_story


def create_story(db: Session, story: schemas.StoryCreate, token_data: str):
    user = None
    # if the story was submitted with an auth token, we want to associate it to the token's user
    if token_data and isinstance(token_data, UserToken):
        user = get_user_by_email(db, email=token_data.email)

    if user and user.story:
        # if the user already had a story, we need to update it.
        db_story = update_story(db, user.story.id, story)
    else:
        db_story = models.Story(**story.dict())
        db.add(db_story)
    db.commit()
    db.refresh(db_story)

    # if the story was submitted with an auth token, we want to associate it to the token's user
    if user and not user.story:
        db.query(User).filter(User.id == user.id).update(
            {"story_id": db_story.id}
        )
        db.commit()
        db.refresh(db_story)

    db_story.token = main.create_access_token(
        data={"story_id": db_story.id}, expires_delta=timedelta(days=5)
    )
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
