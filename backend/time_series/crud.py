import requests
import io
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
import traceback

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


def fetch_total(url):
    df = fetch_url(url)
    return pd.DataFrame(
        df.drop(
            ["Province/State", "Country/Region", "Lat", "Long"], axis=1
        ).sum()
    )


def fetch_latest_total(url):
    latest_date = fetch_total(CONFIRMED_URL).iloc[[-1]].index[0]
    total = fetch_total(CONFIRMED_URL).iloc[[-1]][0][0]
    return total, latest_date


def update(db: Session):
    confirmed_sums = fetch_total(CONFIRMED_URL).rename(
        columns={0: "confirmed"}
    )
    recovered_sums = fetch_total(RECOVERED_URL).rename(
        columns={0: "recovered"}
    )
    deaths_sums = fetch_total(DEATHS_URL).rename(columns={0: "deaths"})
    totals = confirmed_sums.merge(
        recovered_sums, left_index=True, right_index=True
    ).merge(deaths_sums, left_index=True, right_index=True)
    try:
        for day in totals.index:
            this_date = datetime.strptime(day, "%m/%d/%y")
            result = (
                db.query(models.TimeSeries.date)
                .filter_by(date=this_date)
                .scalar()
            )
            if result is not None:
                continue
            db_time = models.TimeSeries(
                date=datetime.strptime(day, "%m/%d/%y"),
                confirmed=int(totals.loc[day][0]),
                recovered=int(totals.loc[day][1]),
                deaths=int(totals.loc[day][2]),
            )
            db.add(db_time)
            db.commit()
            db.refresh(db_time)
        return db
    except Exception:
        traceback.print_exc()
        db.rollback()


def get_n_days_data(db: Session, n: int):
    update_date = (
        db.query(models.TimeSeries)
        .order_by(models.TimeSeries.date.desc())
        .first()
    )
    if (update_date is None) or (
        datetime.now().date() - update_date.date
    ).days > 1:
        update(db)

    return (
        db.query(models.TimeSeries)
        .order_by(models.TimeSeries.date.desc())
        .limit(n)
        .all()
    )


def init_table(db: Session):
    db.query(models.TimeSeries).delete()
    updated = update(db)
    return updated
