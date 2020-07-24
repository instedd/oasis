"""
NYT County-level database management functions
"""

from datetime import datetime
import io
import pandas as pd
import requests
from sqlalchemy.orm import Session
import traceback
from typing import List

from . import models

NYT_CURR_URL = (
    "https://raw.githubusercontent.com/nytimes/covid-19-data"
    "/master/live/us-counties.csv"
)


def get_int_or_null(element):
    """
    Handles missing count data from NYT county spreadsheet
    """
    return int(element) if not pd.isnull(element) else None


def update(db: Session):
    """
    Updates the NYT county database with newest data from the NYT github
    """
    # Pull CSV
    # Helpful SO: https://stackoverflow.com/questions/32400867
    # /pandas-read-csv-from-url
    raw_data = requests.get(NYT_CURR_URL).content
    df = pd.read_csv(io.StringIO(raw_data.decode("utf-8")))

    # Parse into database
    # Helpful structure for this here: https://stackoverflow.com/questions
    # /31394998/using-sqlalchemy-to-load-csv-file-into-a-database
    try:
        for indx, row in df.iterrows():
            db.add(
                models.NytLiveCounty(
                    **{
                        # populate fields here
                        "date": datetime.strptime(row["date"], "%Y-%m-%d"),
                        "county": row["county"],
                        "state": row["state"],
                        "fips": get_int_or_null(row["fips"]),
                        "cases": get_int_or_null(row["cases"]),
                        "deaths": get_int_or_null(row["deaths"]),
                        "confirmed_cases": get_int_or_null(
                            row["confirmed_cases"]
                        ),
                        "confirmed_deaths": get_int_or_null(
                            row["confirmed_deaths"]
                        ),
                        "probable_cases": get_int_or_null(
                            row["probable_cases"]
                        ),
                        "probable_deaths": get_int_or_null(
                            row["probable_deaths"]
                        ),
                    }
                )
            )
        db.commit()
    except Exception:
        traceback.print_exc()
        db.rollback()


def get_nyt_data(db: Session, counties: List[str]):
    """
    Retrieves records from a particular date for a list of counties. If
    counties is [], return all data for all counties
    """
    if len(counties) == 0:
        recs = db.query(models.NytLiveCounty).all()
    else:
        recs = (
            db.query(models.NytLiveCounty)
            # .filter(models.NytLiveCounty.date == date)
            .filter(models.NytLiveCounty.county.in_(counties)).all()
        )
    return recs
