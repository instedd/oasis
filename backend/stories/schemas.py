from datetime import date
from enum import Enum
from typing import List

from pydantic import BaseModel

from users.schemas import User


class Sex(str, Enum):
    female = "female"
    male = "male"
    other = "other"


class MedicalSituation(str, Enum):
    sick = "sick"
    not_sick = "not_sick"
    recovered = "recovered"


class TestSituation(str, Enum):
    positive = "positive"
    negative = "negative"
    not_tested = "not_tested"


class StoryCreate(BaseModel):
    age: int = None
    sex: Sex = None
    ethnicity: str = None
    country_of_origin: str = None
    profession: str = None
    medical_conditions: List[str] = []
    sick: MedicalSituation
    tested: TestSituation
    current_location: str
    sickness_start: str = None
    sickness_end: str = None
    postal_code: str = None


class Story(StoryCreate):
    id: int
    token: str = None
    user: User = None

    class Config:
        orm_mode = True


class SymptomBase(BaseModel):
    name: str


class Symptom(SymptomBase):
    id: int
    name: str
    updated_at: date
    created_at: date

    class Config:
        orm_mode = True


class StorySymptomCreate(BaseModel):
    story_id: int
    symptom_id: int


class StorySymptom(StorySymptomCreate):
    id: int

    class Config:
        orm_mode = True
