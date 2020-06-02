from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, APIRouter, HTTPException, status
from starlette.responses import JSONResponse
from datetime import timedelta
from sqlalchemy.orm import Session
from database import get_db

from users import crud, schemas
from auth import main

router = APIRouter()


@router.post("/auth", response_model=schemas.User)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = crud.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=1)
    access_token = main.create_access_token(
        data={"email": user.email}, expires_delta=access_token_expires
    )
    response = JSONResponse({}, status_code=200)
    response.set_cookie(
        "Authorization",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,
        expires=1800,
    )
    return response
