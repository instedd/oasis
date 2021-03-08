from typing import List
import random
import datetime

from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func, and_
import nltk
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import string
import asyncio

from database import Base
from users.models import User
from . import models, schemas

nltk.download("stopwords")
sampling_trending_words = False


def update(model_id: int, dto: schemas.BaseModel, model: Base, db: Session):
    item_as_dict = dict(dto)
    db_item = db.query(model).filter(model.id == model_id).first()
    for k, v in item_as_dict.items():
        setattr(db_item, k, v)
    db.commit()
    db.refresh(db_item)
    return db_item


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


def get_all_stories(db: Session):
    return (
        db.query(models.Story)
        .filter(models.Story.spam <= 3)
        .options(joinedload("travels"))
        .options(joinedload("symptoms"))
        .options(joinedload("my_stories"))
        .all()
    )


def create_my_story(db: Session, my_story: schemas.MyStoryCreate):
    db_my_story = models.MyStory(**my_story.dict())
    db.add(db_my_story)
    db.commit()

    return db_my_story


def update_my_story(db: Session, my_story: schemas.MyStoryUpdate):
    return update(my_story.id, my_story, models.MyStory, db)


def get_all_latest_my_stories(db: Session):
    subquery = (
        db.query(
            models.MyStory.story_id,
            func.max(models.MyStory.updated_at).label("updated_at"),
        )
        .group_by(models.MyStory.story_id)
        .subquery()
    )
    db_my_stories = (
        db.query(models.MyStory)
        .join(
            subquery,
            and_(
                models.MyStory.story_id == subquery.c.story_id,
                models.MyStory.updated_at == subquery.c.updated_at,
            ),
        )
        .order_by(models.MyStory.id.asc())
        .all()
    )

    return db_my_stories


def update_latest_my_story(db: Session, story: schemas.Story, my_story):
    story.latest_my_story = my_story
    db.add(story)
    db.commit()


def get_my_story_count(db: Session):
    return db.query(models.MyStory).count()


def get_my_story(db: Session, my_story_id: int):
    return (
        db.query(models.MyStory)
        .filter(models.MyStory.id == my_story_id)
        .first()
    )


def search_my_story(db: Session, query: str):
    return (
        db.query(models.MyStory)
        .filter(models.MyStory.text.like("%" + query + "%"))
        .order_by(models.MyStory.updated_at.desc())
        .options(joinedload("story"))
        .all()
    )


def get_story_feed(db: Session, cur_id, lat, lng):
    dist = func.sqrt(
        func.pow(models.Story.latitude - lat, 2)
        + func.pow(models.Story.longitude - lng, 2)
    )

    db_my_stories = (
        db.query(models.MyStory)
        .join(models.Story)
        .filter(models.Story.id != cur_id)
        .order_by(dist)
        .order_by(models.MyStory.updated_at.desc())
        .all()
    )

    return rand_per_story(db_my_stories)


def rand_per_story(arr: [models.MyStory]):
    seen = set()
    output = []

    random.shuffle(arr)

    for ms in arr:
        if ms.story_id not in seen:
            seen.add(ms.story_id)
            output.append(ms)

    return output


def get_trending_words(db: Session):
    db_trending = db.query(models.Trending).first()
    now = datetime.datetime.now()

    if not db_trending or (now - db_trending.updated_at).days >= 7:
        run_sample_task(db, db_trending)

    return db_trending


def run_sample_task(db: Session, to_update):
    global sampling_trending_words
    if sampling_trending_words:
        return

    sampling_trending_words = True
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(sample_trending_words(db, to_update))
    loop.close()


async def sample_trending_words(db: Session, to_update):
    global sampling_trending_words
    k = 3

    db_stories = db.query(models.Story).all()
    stop_words = set(stopwords.words("english"))
    all_words = []

    for story in db_stories:
        for my_story in story.my_stories:
            if not my_story.text:
                continue

            text = my_story.text.lower().translate(
                str.maketrans("", "", string.punctuation)
            )
            for word in text.split():
                if word not in stop_words:
                    all_words.append(word)

    fdist = FreqDist(all_words)
    top = fdist.most_common(k)

    if to_update:
        update(to_update.id, {"data": top}, models.Trending, db)
    else:
        db_trending = models.Trending(data=top)
        db.add(db_trending)
        db.commit()

    sampling_trending_words = False
