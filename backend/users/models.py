from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    email = Column(String(128), unique=True, index=True)
    first_name = Column(String(128))
    password = Column(String(128))
    username = Column(String(64), unique=True)
    story_id = Column(Integer, ForeignKey("stories.id"))
    story = relationship("Story", back_populates="user")
