from typing import List

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import distinct
from sqlalchemy.sql.expression import func

from database import Base
from users.models import User
from . import models, schemas


def update(model_id: int, dto: schemas.BaseModel, model: Base, db: Session):
    item_as_dict = dict(dto)
    db_item = db.query(model).filter(model.id == model_id).first()
    for k, v in item_as_dict.items():
        setattr(db_item, k, v)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_random_stories(db: Session, level: str, k: int):
    k_stories = []
    if level == "country":
        _model = models.Story.country
    elif level == "state":
        _model = models.Story.state
    elif level == "city":
        _model = models.Story.city
    else:
        return None

    db_levels = db.query(distinct(_model)).all()

    for db_level in db_levels:
        db_level = db_level[0]
        k_stories += (
            db.query(models.Story)
            .filter(_model == db_level)
            .order_by(func.rand())
            .limit(k)
            .all()
        )

    return k_stories


def get_story(db: Session, story_id: int):
    db_story = (
        db.query(models.Story)
        .filter(models.Story.id == story_id)
        .options(joinedload("travels"))
        .first()
    )
    return db_story


def update_story(db: Session, story_id: int, story: schemas.StoryCreate):
    return update(story_id, story, models.Story, db)


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


def create_travels(db: Session, travels: List[schemas.TravelCreate]):
    db_travels = [models.Travel(**travel.dict()) for travel in travels]
    db.add_all(db_travels)
    db.commit()
    return db_travels


def update_travel(db: Session, travel: schemas.Travel):
    return update(travel.id, travel, models.Travel, db)


def create_close_contacts(
    db: Session, close_contacts: List[schemas.CloseContactCreate]
):
    db_contacts = [
        models.CloseContact(**contact.dict()) for contact in close_contacts
    ]
    db.add_all(db_contacts)
    db.commit()
    return db_contacts


def update_close_contact(db: Session, close_contact: schemas.CloseContact):
    return update(close_contact.id, close_contact, models.CloseContact, db)
