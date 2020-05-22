from sqlalchemy import Table, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database.database import Base

story_symptoms = Table('story_symptoms', Base.metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('story_id', ForeignKey('stories.id')),
    Column('symptom_id', ForeignKey('symptoms.id'))
)

class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True)

    stories = relationship("Story", secondary=story_symptoms, back_populates="symptom")
