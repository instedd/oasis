import json

from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship

from database import Base


class Story(Base):
    __tablename__ = "stories"

    age = Column(Integer)
    sex = Column(String(64))
    ethnicity = Column(String(128))
    country_of_origin = Column(String(128))
    profession = Column(String(128))
    sick = Column(String(64))
    tested = Column(String(64))
    _medical_conditions = Column(JSON)
    sickness_start = Column(String(64))
    sickness_end = Column(String(64))
    postal_code = Column(String(64))
    current_location = Column(String(128))
    user = relationship("User", uselist=False, back_populates="story")
    symptoms = relationship("Symptom", secondary="story_symptoms")

    @property
    def medical_conditions(self):
        return json.loads(self._medical_conditions)

    @medical_conditions.setter
    def medical_conditions(self, value):
        self._medical_conditions = json.dumps(value)


class StorySymptom(Base):
    __tablename__ = "story_symptoms"

    story_id = Column(ForeignKey("stories.id"))
    symptom_id = Column(ForeignKey("symptoms.id"))


class Symptom(Base):
    __tablename__ = "symptoms"

    name = Column(String(128), unique=True, index=True)


class Travels(Base):
    __tablename__ = "travels"

    story_id = Column(ForeignKey("stories.id"))
    location = Column(String(128))
    date_of_return = Column(Date)
