from typing import List

from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from database import get_db
from NytLiveCounty import crud, schemas

# from datetime import date
import time

router = APIRouter()


@router.get("/{county_ids}", response_model=List[schemas.CountyData])
def get_county_data(county_ids: str, db: Session = Depends(get_db)):
    """
    Returns a list of county data records based on IDs (FIPS) queried
    """
    # Get county ids, check for empty list
    if county_ids == " ":
        return JSONResponse([], status_code=200)
    county_ids = county_ids.split(",")

    # Get result and encode
    res = crud.get_nyt_data(db, county_ids)
    res = jsonable_encoder(res)

    # Check if database needs to be updated
    if max([rec["timestamp"] for rec in res]) < time.time() - 60 * 60 * 6:
        crud.update(db)

    # Return result
    return JSONResponse(res, status_code=200)
