import bcrypt
import os
import jwt
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from jwt import PyJWTError
from fastapi.security import OAuth2PasswordBearer

from database.database import get_db
from . import models, schemas



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth")


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = bcrypt.hashpw(f"{user.password}{os.environ['PEPPER']}".encode('utf8'), bcrypt.gensalt(rounds=16))
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
    return bcrypt.checkpw(f"{plain_text_password}{os.environ['PEPPER']}".encode('utf8'), hashed_password)


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({ "exp": expire })
    encoded_jwt = jwt.encode(to_encode, os.environ['JWT_SECRET'], algorithm='HS512')
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.environ['JWT_SECRET'], algorithms=['HS512'])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except PyJWTError:
        raise credentials_exception
    user = get_user_by_email(get_db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


