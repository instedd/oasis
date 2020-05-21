from fastapi import APIRouter
from router import users, stories, auth

router = APIRouter()

@router.get("/")
def read_root():
    return "Welcome to oasis api 🌴"

router.include_router(users.router, 
    prefix="/users",
    tags=["users"])

router.include_router(stories.router, 
    prefix="/stories",
    tags=["stories"])

router.include_router(auth.router)
