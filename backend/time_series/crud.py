import requests
import io
import pandas as pd

from sqlalchemy.orm import Session

from . import models

CSSEGIREPO = (
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/"
)
CSSETS = CSSEGIREPO + "csse_covid_19_data/csse_covid_19_time_series"
CONFIRMED_URL = CSSETS + "/time_series_covid19_confirmed_global.csv"
RECOVERED_URL = CSSETS + "/time_series_covid19_recovered_global.csv"
DEATHS_URL = CSSETS + "/time_series_covid19_deaths_global.csv"


def fetchUrl(url):
    s = requests.get(url).content
    return pd.read_csv(io.StringIO(s.decode("utf-8")))


def fetchLatestTotal(url):
    df = fetchUrl(url)
    return sum(df[df.columns[-1]]), df.columns[-1]


def add_new_day(db: Session):

    confirmed_today, today = fetchLatestTotal(CONFIRMED_URL)
    recovered_today = fetchLatestTotal(RECOVERED_URL)
    deaths_today = fetchLatestTotal(DEATHS_URL)

    db_time = models.TimeSeries(
        data=today,
        confirmed=confirmed_today,
        recovered=recovered_today,
        deaths=deaths_today,
    )
    db.add(db_time)
    db.commit()
    db.refresh(db_time)
    return db_time


def remove_oldest_day(db: Session):
    oldest = (
        db.query(models.TimeSeries).order_by(models.TimeSeries.data).first()
    )
    db.delete(oldest)
    db.commit()
