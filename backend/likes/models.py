from database import Base
from sqlalchemy import Column, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship


class Like(Base):
    __tablename__ = "likes"

    like = Column(Boolean)
    my_story_id = Column(Integer, ForeignKey("my_stories.id"))
    liker_story_id = Column(Integer, ForeignKey("stories.id"))

    my_story = relationship("MyStory", lazy="select")
