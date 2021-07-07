from datetime import date
from pydantic import BaseModel
from stories.schemas import Story


class CommentUpdate(BaseModel):
    text: str


class CommentBase(CommentUpdate):
    parent: int = None


class CommentCreate(CommentBase):
    story_id: int
    my_story_id: int


class Comment(CommentCreate):
    id: int
    updated_at: date
    created_at: date
    story: Story = None
    reported: bool = None

    class Config:
        orm_mode = True


class CommentLikeCreate(BaseModel):
    like: bool = None


class CommentLike(CommentLikeCreate):
    comment_id: int
    story_id: int

    class Config:
        orm_mode = True


class CommentSpamCreate(BaseModel):
    spam: bool = None


class CommentSpam(CommentSpamCreate):
    comment_id: int
    story_id: int

    class Config:
        orm_mode = True
