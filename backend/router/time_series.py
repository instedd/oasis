from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from database import get_db
from time_series import crud, schemas


router = APIRouter()


# A fuction to update db
@router.get("/update", response_model=schemas.TimeSeriesData)
def update(db: Session = Depends(get_db)):
    crud.update(db)


# A function to get n lastest today
@router.get("/{n}", response_model=schemas.TimeSeriesData)
def get_timeseries_data(n: int, db: Session = Depends(get_db)):
    """
    Returns a list of time series data based on the number of days
    """

    res = crud.get_n_days_data(db, n)
    n_days = list(map(lambda day: jsonable_encoder(day), res))
    return JSONResponse(n_days, status_code=200)
