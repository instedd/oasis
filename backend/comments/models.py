from sqlalchemy import Column, Text, ForeignKey, Integer
from database import Base
from sqlalchemy.orm import relationship


class Comment(Base):
    __tablename__ = "comments"

    text = Column(Text)
    parent = Column(Integer, ForeignKey("comments.id"))
    story_id = Column(Integer, ForeignKey("stories.id"))
    my_story_id = Column(Integer, ForeignKey("my_stories.id"))

    story = relationship("Story", back_populates="comments")
    my_story = relationship("MyStory", back_populates="comments")
