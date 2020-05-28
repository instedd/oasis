from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    email: str
    first_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    class Config:
        orm_mode = True
