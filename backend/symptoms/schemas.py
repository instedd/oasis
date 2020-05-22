from typing import List

from pydantic import BaseModel


class SymptomBase(BaseModel):
    name: str


class Symptom(SymptomBase):
    id: int
    class Config:
        orm_mode = True
