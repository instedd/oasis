import os

from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, APIRouter, HTTPException, status
from starlette.responses import JSONResponse
from sqlalchemy.orm import Session
from starlette.requests import Request

from database import get_db
from users import crud, schemas
from auth import main

router = APIRouter()


@router.post("/auth", response_model=schemas.User)
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    token_data = await main.get_token_if_present(request)
    user = crud.authenticate_user(
        form_data.username, form_data.password, token_data, db
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = main.create_access_token(data={"email": user.email})
    response = JSONResponse({}, status_code=200)
    response.set_cookie(
        "Authorization",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=os.environ["COOKIE_EXPIRATION_SECONDS"],
        expires=os.environ["COOKIE_EXPIRATION_SECONDS"],
    )
    return response


@router.post("/auth/external", response_model=schemas.User)
async def external_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_email(db, email=form_data.username)

    if not user:
        new_user = schemas.UserCreate(email=form_data.username, password="")
        user = crud.create_user(db=db, user=new_user)

    access_token = main.create_access_token(data={"email": user.email})
    response = JSONResponse({}, status_code=200)
    response.set_cookie(
        "Authorization",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=os.environ["COOKIE_EXPIRATION_SECONDS"],
        expires=os.environ["COOKIE_EXPIRATION_SECONDS"],
    )
    return response
