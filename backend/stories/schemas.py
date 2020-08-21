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


class TravelCreate(BaseModel):
    story_id: int
    location: str
    date_of_return: date


class Travel(TravelCreate):
    id: int

    class Config:
        orm_mode = True


class CloseContactCreate(BaseModel):
    story_id: int
    email: str
    phone_number: str = None


class CloseContact(CloseContactCreate):
    id: int

    class Config:
        orm_mode = True


class StoryCreate(BaseModel):
    age: int = None
    sex: Sex = None
    country_of_origin: str = None
    city: str = None
    state: str = None
    country: str = None
    profession: str = None
    medical_conditions: List[str] = []
    sick: MedicalSituation
    tested: TestSituation
    sickness_start: str = None
    sickness_end: str = None
    close_contacts: List[CloseContact] = []
    my_story: str = None
    spam: int = 0
    latitude: float = None
    longitude: float = None


class Story(StoryCreate):
    id: int
    token: str = None
    user: User = None
    travels: List[Travel] = []
    close_contacts: List[CloseContact] = []

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


class MyStoryCreate(BaseModel):
    text: str
    story_id: int


class MyStory(MyStoryCreate):
    id: int

    class Config:
        orm_mode = True
