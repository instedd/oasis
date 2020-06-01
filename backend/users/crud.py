import bcrypt
import os
from sqlalchemy.orm import Session

from database import get_db
from . import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return (
        db.query(models.User).filter(models.User.username == username).first()
    )


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = bcrypt.hashpw(
        f"{user.password}{os.environ['PEPPER']}".encode("utf8"),
        bcrypt.gensalt(rounds=16),
    )
    db_user = models.User(
        email=user.email,
        first_name=user.first_name,
        username=user.username,
        password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        f"{plain_password}{os.environ['PEPPER']}".encode("utf8"),
        hashed_password.encode("utf8"),
    )


def authenticate_user(email: str, password: str, db: Session):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user
