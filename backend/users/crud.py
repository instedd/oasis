import os
import bcrypt

from sqlalchemy.orm import Session

from auth import schemas as auth_schemas
from . import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = bcrypt.hashpw(
        f"{user.password}{os.environ['PEPPER']}".encode("utf8"),
        bcrypt.gensalt(rounds=16),
    )
    db_user = models.User(email=user.email, password=hashed_password,)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        f"{plain_password}{os.environ['PEPPER']}".encode("utf8"),
        hashed_password.encode("utf8"),
    )


def authenticate_user(email: str, password: str, token_data, db: Session):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False

    if token_data and isinstance(token_data, auth_schemas.StoryToken):
        db.query(models.User).filter(models.User.id == user.id).update(
            {"story_id": token_data.story_id}
        )
        db.commit()
    return user
