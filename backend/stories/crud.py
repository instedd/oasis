import json

from fastapi import Depends
from sqlalchemy.orm import Session

from users.crud import get_user_by_email, oauth2_scheme, create_access_token
from users.schemas import TokenData
from users.models import User
from . import models, schemas


def get_story(db: Session, story_id: int):
    db_story = db.query(models.Story).filter(models.Story.id == story_id).first()
    return db_story



def create_story(db: Session, story: schemas.CreateStory, token_data: str):
    db_story = models.Story(
        age=story.age, 
        sex=story.sex, 
        ethnicity=story.ethnicity, 
        country_of_origin=story.country_of_origin, 
        profession=story.profession, 
        medical_problems=story.medical_problems, 
        sick=story.sick, 
        tested=story.tested,
        sickness_start=story.sickness_start,
        sickness_end=story.sickness_end,
        current_location=story.current_location)
    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    # if the story was submitted with an auth token, we want to associate it to the token's user
    if token_data is not None:
        user = get_user_by_email(db, email=token_data.email)
        if user is not None:
            db.query(User).filter(User.id==user.id).update({"story_id": db_story.id})
            db.commit()
            db.refresh(db_story)

    new_story = schemas.Story.from_module(db_story)
    new_story.token = create_access_token(
        data={"story_id": db_story.id}, expires_delta=timedelta(days=5)
    )
    return new_story
