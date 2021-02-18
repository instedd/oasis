import os
import bcrypt

from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func
from datetime import datetime

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

    return user


def get_user_count(db: Session):
    return db.query(models.User).count()


def get_user_trend(db: Session):
    cur_month = datetime.now().month
    cur_year = datetime.now().year
    out = []

    for month, year in past_six_months(cur_month, cur_year):
        count = (
            db.query(models.User)
            .filter(func.extract("year", models.User.created_at) == year)
            .filter(func.extract("month", models.User.created_at) == month)
            .count()
        )
        out.append(count)

    return out


def past_six_months(start_month, start_year):
    for i in range(6):
        month = start_month - i
        year = start_year if month > 0 else start_year - 1
        yield month % 12, year
