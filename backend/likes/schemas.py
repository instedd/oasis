from pydantic import BaseModel


class LikeCreate(BaseModel):
    like: bool = None
    story_id: int


class Like(LikeCreate):
    liker_story_id: int

    class Config:
        orm_mode = True
