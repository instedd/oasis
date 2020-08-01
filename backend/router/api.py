from fastapi import APIRouter

from router import auth, stories, users, symptoms, data, time_series

router = APIRouter()

router.include_router(users.router, prefix="/users", tags=["users"])

router.include_router(stories.router, prefix="/stories", tags=["stories"])

router.include_router(symptoms.router, prefix="/symptoms", tags=["symptoms"])

router.include_router(data.router, prefix="/data", tags=["data"])

router.include_router(auth.router)

router.include_router(
    time_series.router, prefix="/time_series", tags=["time_series"]
)
