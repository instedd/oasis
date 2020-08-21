import json

from sqlalchemy import (
    JSON,
    Column,
    ForeignKey,
    Integer,
    String,
    Date,
    Text,
    Numeric,
)
from sqlalchemy.orm import relationship

from database import Base


class Story(Base):
    __tablename__ = "stories"

    age = Column(Integer)
    sex = Column(String(64))
    country_of_origin = Column(String(128))
    city = Column(String(128))
    state = Column(String(128))
    country = Column(String(128))
    profession = Column(String(128))
    sick = Column(String(64))
    tested = Column(String(64))
    _medical_conditions = Column(JSON)
    sickness_start = Column(String(64))
    sickness_end = Column(String(64))
    spam = Column(Integer)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))

    user = relationship("User", uselist=False, back_populates="story")
    symptoms = relationship("Symptom", secondary="story_symptoms")
    travels = relationship("Travel", lazy="select")
    close_contacts = relationship("CloseContact", lazy="select")
    my_stories = relationship("MyStory", lazy="select")

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


class Travel(Base):
    __tablename__ = "travels"

    story_id = Column(ForeignKey("stories.id"))
    location = Column(String(128))
    date_of_return = Column(Date)


class CloseContact(Base):
    __tablename__ = "close_contacts"

    story_id = Column(ForeignKey("stories.id"))
    email = Column(String(128))
    phone_number = Column(String(64))


class ExposureNotification(Base):
    __tablename__ = "exposure_notifications"

    email = Column(String(128), unique=True)
    notified_at = Column(Date)


class StoryNotification(Base):
    __tablename__ = "story_notifications"

    story_id = Column(ForeignKey("stories.id"))
    notification_id = Column(ForeignKey("exposure_notifications.id"))


class MyStory(Base):
    __tablename__ = "my_stories"

    text = Column(Text())
    story_id = Column(Integer, ForeignKey("stories.id"))
