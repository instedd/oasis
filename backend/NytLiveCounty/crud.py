"""
NYT County-level database management functions
"""

from datetime import datetime
import pandas as pd
from sqlalchemy.orm import Session
import traceback
from typing import List
from os import path
import subprocess
from git import Repo
import time
from fastapi import Depends
from database import get_db

from . import models

# import asyncio
import pytz

NYT_CURR_URL = (
    "https://raw.githubusercontent.com/nytimes/covid-19-data"
    "/master/live/us-counties.csv"
)

FIFTEEN_DAYS_AGO = time.time() - 60 * 60 * 24 * 15


def get_day_from_ts(ts):
    """
    Gets the day of the YEAR (integer) from a unix timestamp
        https://www.w3resource.com/python-exercises/date-time-exercise/
        python-date-time-exercise-11.php
    """
    day = datetime.fromtimestamp(ts)
    return (day - datetime(day.year, 1, 1)).days + 1


# Threshold for how old data can be
DB_AGE_LIMIT = 60 * 60 * 24 * 14  # Two weeks
STALE_DATE = get_day_from_ts(time.time() - DB_AGE_LIMIT)


def get_type_or_null(element, to_type):
    """
    Takes an object and returns the desired casting, otherwise returns
    None if element is a pandas null. Used to do both type conversion and
    missing data handling for sanitizing the NYT dataset
    """
    return to_type(element) if not pd.isnull(element) else None


def check_and_reset_repo():
    """
    Checks if the NYT repo exists in the current directory, else clones it,
    otherwise checks out master and pulls it
    """
    subprocess.call("rm -f /app/covid-19-data/.git/index.lock", shell=True)
    if not path.isdir("covid-19-data"):
        subprocess.call(
            "git clone https://github.com/nytimes/covid-19-data.git",
            shell=True,
        )
    else:
        subprocess.call(
            "cd covid-19-data && git checkout -f master && cd ../", shell=True
        )
        subprocess.call("cd covid-19-data && git pull && cd ../", shell=True)


def build_new_db_row(row, now, commit: str):
    """
    Takes a row from the pandas representation of an NYT
    """

    new_row = models.NytLiveCounty(
        **{
            # populate fields here
            "date": datetime.strptime(row["date"], "%Y-%m-%d"),
            "county": row["county"],
            "state": row["state"],
            "fips": get_type_or_null(row["fips"], str),
            "cases": get_type_or_null(row["cases"], int),
            "deaths": get_type_or_null(row["deaths"], int),
            "confirmed_cases": get_type_or_null(row["confirmed_cases"], int),
            "confirmed_deaths": get_type_or_null(row["confirmed_deaths"], int),
            "probable_cases": get_type_or_null(row["probable_cases"], int),
            "probable_deaths": get_type_or_null(row["probable_deaths"], int),
            # "timestamp": int(time.time()),
            "timestamp": int(
                # datetime.strptime(row["date"], "%Y-%m-%d").timestamp()
                # datetime.now().timestamp()
                now
            ),
            "commit": commit,
        }
    )
    return new_row


# def add_data(db: Session, path: str, commit_hex: str):
def add_data(db: Session, df, commit_hex):
    """
    This function adds a set of data to the database without checking for
    duplicate data, time limit, etc. DOES NOT COMMIT OR ROLLBACK. DOES NOT
    HANDLE EXCEPTIONS - ALL OF THIS MUST BE DONE BY CALLER
    """
    now = datetime.now().timestamp()
    # df = pd.read_csv(path, dtype=str)
    # df = df[df["fips"].notna()]

    for indx, row in df.iterrows():
        db.add(build_new_db_row(row, now, commit_hex))


# def seed(db: Session = Depends(get_db), fake_date=None):
def load_all_nyt_data(fake_date=None):
    """
    Replaces the contents of the existing NytLiveCounty database with the
    last 14 days of data from the NYT github repo

    fake_date is for testing purposes - it forces the function to populate the
    database assuming that today is fake_date - type is datetime
    """
    global STALE_DATE

    # Check if repo needs to be pulled, otherwise make sure it's on master
    check_and_reset_repo()

    # Initialize repo interface
    repo = Repo("covid-19-data")

    # Set current commit
    cmt = repo.heads.master.commit

    # If testing, crawl back in time to fake date
    if fake_date is not None:
        # cmt_date = pytz.UTC.localize(cmt.authored_datetime)
        while cmt.authored_datetime > pytz.UTC.localize(fake_date):
            cmt = cmt.parents[0]  # Assumes no branchpoints :/
        stale_date = datetime.timestamp(fake_date) - DB_AGE_LIMIT
        STALE_DATE = get_day_from_ts(stale_date)

    # Define a function to get a timestamp from a git commit
    def get_ts(commit):
        return commit.authored_datetime.timestamp()

    # Loop and load data
    all_records = []  # list of (commit hex, dataframe)
    while get_day_from_ts(get_ts(cmt)) > STALE_DATE:
        # Checkout data
        subprocess.call("rm -f /app/covid-19-data/.git/index.lock", shell=True)
        subprocess.call(
            f"cd covid-19-data && git checkout -f {cmt.hexsha} && cd ../",
            shell=True,
        )

        # Load data
        df = pd.read_csv("covid-19-data/live/us-counties.csv", dtype=str)
        df = df[df["fips"].notna()]

        # Add to all_records
        all_records.append((cmt.hexsha, df))

        # Set pointer to next commit
        yesterday = get_day_from_ts(get_ts(cmt)) - 1
        while get_day_from_ts(get_ts(cmt)) != yesterday:
            cmt = cmt.parents[0]  # Assumes no branchpoints :/

    return all_records


def populate_nyt_data(records, db: Session = Depends(get_db)):
    # Add data to database
    try:
        # Clear existing database
        db.query(models.NytLiveCounty).delete()

        # Add records to db
        for record in records:
            add_data(db, record[1], record[0])

        db.commit()

    except Exception:
        traceback.print_exc()
        print("ABANDONING NYT DATA POPULATION")
        db.rollback()


async def update(db: Session):
    """
    Updates the NYT county database with newest data from NYT github
    """
    now = datetime.now().timestamp()
    try:
        # Make sure repo is up to date and on master
        check_and_reset_repo()

        old_recs = (
            db.query(models.NytLiveCounty)
            .filter(models.NytLiveCounty.timestamp < FIFTEEN_DAYS_AGO)
            .all()
        )
        for rec in old_recs:
            db.delete(rec)

        # Identify master commit hash
        repo = Repo("covid-19-data")
        cmt_hex = repo.heads.master.commit.hexsha

        recs_with_hex = (
            db.query(models.NytLiveCounty)
            .filter(models.NytLiveCounty.commit.in_([cmt_hex]))
            .all()
        )

        if len(recs_with_hex) > 0:  # we already have this data
            db.commit()
            return

        # Load data
        df = pd.read_csv("covid-19-data/live/us-counties.csv", dtype=str)
        df = df[df["fips"].notna()]

        for indx, row in df.iterrows():
            db.add(build_new_db_row(row, now, cmt_hex))

        db.commit()

    except Exception:
        traceback.print_exc()
        db.rollback()


def get_nyt_data(db: Session, county_ids: List[str]):
    """
    Retrieves records for a list of FIPS codes
    """
    # Check if need to call seed
    # print(db.query(models.NytLiveCounty).one_or_none())
    # if db.query(models.NytLiveCounty).one_or_none() is None:
    #    seed(db)

    # Execute query
    recs = (
        db.query(models.NytLiveCounty)
        .filter(models.NytLiveCounty.fips.in_(county_ids))
        .all()
    )
    return recs
