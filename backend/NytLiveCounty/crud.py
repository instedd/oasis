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

# from fastapi import Depends
from database import get_db

from . import models

# import asyncio
import pytz

NYT_CURR_URL = (
    "https://raw.githubusercontent.com/nytimes/covid-19-data"
    "/master/live/us-counties.csv"
)

FIFTEEN_DAYS_AGO = time.time() - 60 * 60 * 24 * 15


def run_git_command(cmd):
    """
    A wrapper for git commands with subprocess that makes sure the
    lockfile is removed every time.
    """
    subprocess.call("rm -f /app/covid-19-data/.git/index.lock", shell=True)
    subprocess.call(cmd, shell=True)


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
    if not path.isdir("covid-19-data"):
        run_git_command(
            "git clone https://github.com/nytimes/covid-19-data.git"
        )
    else:
        run_git_command("cd covid-19-data && git checkout -f master && cd ../")
        run_git_command("cd covid-19-data && git pull && cd ../")


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


def add_data(df, commit_hex: str):
    """
    This function adds a set of data to the database without checking for
    duplicate data, time limit, etc. DOES NOT COMMIT OR ROLLBACK. DOES NOT
    HANDLE EXCEPTIONS - ALL OF THIS MUST BE DONE BY CALLER
    """
    now = datetime.now().timestamp()
    # df = pd.read_csv(path, dtype=str)
    # df = df[df["fips"].notna()]
    db = next(get_db())

    try:
        # for indx, row in df.iterrows():
        #    db.add(build_new_db_row(row, now, commit_hex))
        # db.commit()
        recs = []
        for indx, row in df.iterrows():
            recs.append(build_new_db_row(row, now, commit_hex))
        db.bulk_save_objects(recs)
        db.commit()

    except Exception:
        traceback.print_exc()
        db.rollback()


# async def seed(fake_date = None):
def seed(fake_date=None):
    """
    Replaces the contents of the existing NytLiveCounty database with the
    last 14 days of data from the NYT github repo
    fake_date is for testing purposes - it forces the function to populate the
    database assuming that today is fake_date - type is datetime
    """
    global STALE_DATE
    # Clear existing database
    # db.query(models.NytLiveCounty).delete()

    # Check if repo needs to be pulled otherwise make sure it's on master
    check_and_reset_repo()

    # Initialize repo object
    repo = Repo("covid-19-data")

    # Set current commit
    # cmt = repo.heads.master.commit
    cmt = repo.head.commit

    # If testing, crawl back in time to fake date
    if fake_date is not None:
        # cmt_date = pytz.UTC.localize(cmt.authored_datetime)
        while cmt.authored_datetime > pytz.UTC.localize(fake_date):
            cmt = cmt.parents[0]  # Assumes no branchpoints :/
        stale_date = datetime.timestamp(fake_date) - DB_AGE_LIMIT
        STALE_DATE = get_day_from_ts(stale_date)

    def get_ts(commit):
        return commit.authored_datetime.timestamp()

    while get_day_from_ts(get_ts(cmt)) > STALE_DATE:
        # Checkout data
        run_git_command(
            f"cd covid-19-data && git checkout -f {cmt.hexsha} && cd ../"
        )

        # Load data
        # add_data(db, "covid-19-data/live/us-counties.csv", cmt.hexsha)

        df = pd.read_csv("covid-19-data/live/us-counties.csv", dtype=str)
        df = df[df["fips"].notna()]
        add_data(df, cmt.hexsha)

        # Select next data to load
        yesterday = get_day_from_ts(get_ts(cmt)) - 1
        while get_day_from_ts(get_ts(cmt)) != yesterday:
            cmt = cmt.parents[0]  # Assumes no branchpoints :/

    # clear old data
    db = next(get_db())
    try:
        old_recs_count = (
            db.query(models.NytLiveCounty).filter(
                models.NytLiveCounty.timestamp < FIFTEEN_DAYS_AGO
            )
            # .all()
            .delete()
        )
        print(f"Old recs count: {old_recs_count}")
        # for rec in old_recs:
        #    db.delete(rec)

        if fake_date is not None:
            too_new_recs_count = (
                db.query(models.NytLiveCounty).filter(
                    models.NytLiveCounty.date > fake_date
                )
                # .all()
                .delete()
            )
            print(f"too_new_recs_count: {too_new_recs_count}")
            # for rec in too_new_recs:
            #    db.delete(rec)

        db.commit()

    except Exception:
        traceback.print_exc()
        print("ABANDONING NYT DATA POPULATION")
        db.rollback()


# async def update(db: Session):
async def update():
    """
    Updates the NYT county database with newest data from NYT github
    """
    print("update has been called")
    # now = datetime.now().timestamp()
    try:
        # Make sure repo is up to date and on master
        check_and_reset_repo()

        db = next(get_db())
        old_recs_count = (
            db.query(models.NytLiveCounty).filter(
                models.NytLiveCounty.timestamp < FIFTEEN_DAYS_AGO
            )
            # .all()
            .delete()
        )
        db.commit()
        print(f"old_recs_count: {old_recs_count}")
        # print(f"Update found {len(old_recs)} old rows to delete")
        # for rec in old_recs:
        #    db.delete(rec)

        # Identify master commit hash
        repo = Repo("covid-19-data")
        # cmt_hex = repo.heads.master.commit.hexsha
        cmt_hex = repo.head.commit.hexsha

        db = next(get_db())
        recs_with_hex = (
            db.query(models.NytLiveCounty)
            .filter(models.NytLiveCounty.commit.in_([cmt_hex]))
            .all()
        )
        db.commit()
        print(f"Update found {len(recs_with_hex)} that are in master")

        if len(recs_with_hex) > 0:  # we already have this data
            print("Update() detected up-to-date data, exiting...")
            db.commit()
            return

        # Load data
        df = pd.read_csv("covid-19-data/live/us-counties.csv", dtype=str)

        print(f"Update is adding {df.shape[0]} new rows")
        print(f"The date for one of these is {df.loc[0,'date']}")
        # for indx, row in df.iterrows():
        #    db.add(build_new_db_row(row, now, cmt_hex))
        add_data(df, cmt_hex)

        # db.commit()

    except Exception:
        traceback.print_exc()
        db.rollback()

    print("reached the end of update")


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
