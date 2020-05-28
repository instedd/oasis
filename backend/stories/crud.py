from sqlalchemy.orm import Session

from . import models, schemas


def get_story(db: Session, story_id: int):
    db_story = db.query(models.Story).filter(models.Story.id == story_id).first()
    return db_story


def create_story(db: Session, story: schemas.StoryCreate):
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
    return db_story
