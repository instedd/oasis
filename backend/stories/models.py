from sqlalchemy import Column, ForeignKey, Integer, String, Table, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import json

Base = declarative_base()

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    sex = Column(String(64))
    ethnicity = Column(String(128))
    country_of_origin = Column(String(128))
    profession = Column(String(128))
    sick = Column(String(64))
    tested = Column(String(64))
    _medical_problems = Column(JSON)

    @property
    def medical_problems(self):
        return json.loads(self._medical_problems)
        
    @medical_problems.setter
    def medical_problems(self, value):
        self._medical_problems = json.dumps(value)
