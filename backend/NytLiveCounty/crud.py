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


def get_type_or_null(element, to_type):
    """
    Takes an object and returns the desired casting, otherwise returns
    None if element is a pandas null. Used to do both type conversion and
    missing data handling for sanitizing the NYT dataset
    """
    return to_type(element) if not pd.isnull(element) else None


def update(db: Session):
    """
    Updates the NYT county database with newest data from the NYT github
    """
    # Pull CSV
    # Helpful SO: https://stackoverflow.com/questions/32400867
    # /pandas-read-csv-from-url
    raw_data = requests.get(NYT_CURR_URL).content
    df = pd.read_csv(io.StringIO(raw_data.decode("utf-8")), dtype=str)
    df = df[df["fips"].notna()]

    # Parse into database
    # Helpful structure for this here: https://stackoverflow.com/questions
    # /31394998/using-sqlalchemy-to-load-csv-file-into-a-database
    try:
        db.query(models.NytLiveCounty).delete()
        for indx, row in df.iterrows():
            db.add(
                models.NytLiveCounty(
                    **{
                        # populate fields here
                        "date": datetime.strptime(row["date"], "%Y-%m-%d"),
                        "county": row["county"],
                        "state": row["state"],
                        "fips": get_type_or_null(row["fips"], str),
                        "cases": get_type_or_null(row["cases"], int),
                        "deaths": get_type_or_null(row["deaths"], int),
                        "confirmed_cases": get_type_or_null(
                            row["confirmed_cases"], int
                        ),
                        "confirmed_deaths": get_type_or_null(
                            row["confirmed_deaths"], int
                        ),
                        "probable_cases": get_type_or_null(
                            row["probable_cases"], int
                        ),
                        "probable_deaths": get_type_or_null(
                            row["probable_deaths"], int
                        ),
                    }
                )
            )
        db.commit()
    except Exception:
        traceback.print_exc()
        db.rollback()


def get_nyt_data(db: Session, county_ids: List[str]):
    """
    Retrieves records for a list of FIPS codes
    """
    update(db)  # TODO - REMOVE ME ONCE INTELLIGENT UPDATING IMPLEMENTED
    recs = (
        db.query(models.NytLiveCounty)
        .filter(models.NytLiveCounty.fips.in_(county_ids))
        .all()
    )
    return recs
