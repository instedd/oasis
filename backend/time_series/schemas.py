from datetime import date
from pydantic import BaseModel


class TimeSeriesData(BaseModel):
    date: date
    confirmed = int
    recovered = int
    deaths = int
