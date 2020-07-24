from typing import List

from fastapi import Depends, APIRouter
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from database import get_db
from NytLiveCounty import crud, schemas

# from datetime import date


router = APIRouter()


# A function to get based on list of counties
@router.get("/{county_names}", response_model=List[schemas.CountyData])
def get_county_data(county_names: str, db: Session = Depends(get_db)):
    """
    Returns a list of county data records based on county names queried
    """
    counties = county_names.split(",")
    res = crud.get_nyt_data(db, counties)
    res = jsonable_encoder(res)
    return JSONResponse(res, status_code=200)
