from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from database import get_db
from time_series import crud, schemas


router = APIRouter()


# A function to get n lastest today
@router.get("/{n}", response_model=schemas.TimeSeriesData)
def get_county_data(n: int, db: Session = Depends(get_db)):
    """
    Returns a list of county data records based on county names queried
    """
    res = crud.get_n_days_data(db, n)
    res = jsonable_encoder(res)
    return JSONResponse(res, status_code=200)
