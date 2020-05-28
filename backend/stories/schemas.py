from enum import Enum
from typing import List

from pydantic import BaseModel

from . import models


class Sex(str, Enum):
    female = "female"
    male = "male"
    other = "other"

class MedicalSituation(str, Enum):
    sick = "sick"
    not_sick = "not sick"
    recovered = "recovered"

class TestSituation(str, Enum):
    positive = "positive"
    negative = "negative"
    not_tested = "not tested"

class StoryCreate(BaseModel):
    age: str
    sex: Sex
    ethnicity: str
    country_of_origin: str
    profession: str
    medical_problems: List[str] = []
    sick: MedicalSituation
    tested: TestSituation
    current_location: str
    sickness_start: str = None
    sickness_end: str = None

class Story(StoryCreate):
    id: int
    class Config:
        orm_mode: True

    @staticmethod
    def from_module(db_story: models.Story):
        return Story(
            id=db_story.id, 
            age=db_story.age, 
            sex=db_story.sex, 
            ethnicity=db_story.ethnicity, 
            country_of_origin=db_story.country_of_origin, 
            profession=db_story.profession, 
            medical_problems=db_story.medical_problems, 
            sick=db_story.sick, 
            tested=db_story.tested,
            current_location=db_story.current_location,
            sickness_start=db_story.sickness_start,
            sickness_end=db_story.sickness_end
            )
