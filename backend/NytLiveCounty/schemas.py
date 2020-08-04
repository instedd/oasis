from datetime import date
from pydantic import BaseModel


class CountyData(BaseModel):
    date: date
    county: str
    state: str
    fips: str
    cases: int
    deaths: int
    confirmed_cases: int
    confirmed_deaths: int
    probable_cases: int
    probable_deaths: int
