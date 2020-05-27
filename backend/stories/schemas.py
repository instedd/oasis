from enum import Enum
from typing import List
from pydantic import BaseModel
from datetime import timedelta

from users.schemas import User


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


class CreateStory(BaseModel):
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


class Story(CreateStory):
    id: int
    token: str = None
    user: User = None
    class Config:
        orm_mode = True
