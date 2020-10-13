from database import Base
from sqlalchemy import Column, ForeignKey, Integer, Boolean


class Like(Base):
    __tablename__ = "likes"

    like = Column(Boolean)
    story_id = Column(Integer, ForeignKey("stories.id"))
    liker_story_id = Column(Integer, ForeignKey("stories.id"))
