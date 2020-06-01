from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class UserToken(BaseModel):
    email: str = None


class StoryToken(BaseModel):
    story_id: int = None
