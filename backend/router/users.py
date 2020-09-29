from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import main
from database import get_db
from users import crud, schemas

router = APIRouter()


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400, detail=f"The email {user.email} is already in use"
        )
    return crud.create_user(db=db, user=user)


@router.get("/me/", response_model=schemas.User)
async def read_users_me(
    current_user: schemas.User = Depends(main.get_current_user),
):
    return current_user


@router.get("/count/")
def get_user_count(db: Session = Depends(get_db)):
    return crud.get_user_count(db)
