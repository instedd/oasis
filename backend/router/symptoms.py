from typing import List

from fastapi import Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from stories import crud, schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Symptom])
def read_symptoms(db: Session = Depends(get_db)):
    return crud.get_symptoms(db)
