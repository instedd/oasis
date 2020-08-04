from typing import List

from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from database import get_db
from NytLiveCounty import crud, schemas

# from datetime import date

router = APIRouter()


@router.get("/{county_ids}", response_model=List[schemas.CountyData])
def get_county_data(county_ids: str, db: Session = Depends(get_db)):
    """
    Returns a list of county data records based on IDs (FIPS) queried
    """
    county_ids = county_ids.split(",")
    res = crud.get_nyt_data(db, county_ids)
    res = jsonable_encoder(res)
    return JSONResponse(res, status_code=200)
