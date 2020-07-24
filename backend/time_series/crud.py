import requests
import io
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session

from . import models

CSSEGIREPO = (
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/"
)
CSSETS = CSSEGIREPO + "csse_covid_19_data/csse_covid_19_time_series"
CONFIRMED_URL = CSSETS + "/time_series_covid19_confirmed_global.csv"
RECOVERED_URL = CSSETS + "/time_series_covid19_recovered_global.csv"
DEATHS_URL = CSSETS + "/time_series_covid19_deaths_global.csv"
PERIOD = 14


def fetch_url(url):
    s = requests.get(url).content
    return pd.read_csv(io.StringIO(s.decode("utf-8")))


def last_n_days_total(url, n):
    df = fetch_url(url)
    day = -1 * n
    lastndays = df[df.columns[day:]]
    sums = lastndays.sum().tolist()
    days = lastndays.columns.tolist()
    return sums, days


def fetch_latest_total(url):
    sums, days = last_n_days_total(url, 1)
    return sums[0], days[0]


def init_table(db: Session):
    confirmed_sums, days = last_n_days_total(CONFIRMED_URL, PERIOD)
    recovered_sums = last_n_days_total(RECOVERED_URL, PERIOD)
    deaths_sums = last_n_days_total(DEATHS_URL, PERIOD)
    for day in range(PERIOD):
        db_time = models.TimeSeries(
            date=datetime.strptime(days[day], "%d/%m/%y"),
            confirmed=confirmed_sums[day],
            recovered=recovered_sums[day],
            deaths=deaths_sums[day],
        )
        db.add(db_time)
        db.commit()
        db.refresh(db_time)
    return db


def add_new_day(db: Session):

    confirmed_today, today = fetch_latest_total(CONFIRMED_URL)
    recovered_today = fetch_latest_total(RECOVERED_URL)
    deaths_today = fetch_latest_total(DEATHS_URL)

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
