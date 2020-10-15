import json

from NytLiveCounty import crud, models
from datetime import datetime
import time
from sqlalchemy import func

# import asyncio


'''
TODO - FIX THIS ENDPOINT
def test_query_counties(setup):
    """
    Tests if the two counties Cook and San Diego can be queried correctly
    """
    response = setup["app"].get("/api/data/county")
    assert len(json.loads(response.content)["clusters"]) == 5
'''


def test_query_all_data(setup):
    """
    Test intergration of NYT data with data/all
    """
    response = setup["app"].get("/api/data/all")
    assert len(json.loads(response.content)["clusters"]) == 10


def test_seed_fake_date(setup):
    """
    This test case tests that the "fake_date" parameter to seed works
    """
    # crud.seed(fake_date=datetime(month=8, day=29, year=2020))
    today = datetime.now()
    yesterday = datetime.fromtimestamp(datetime.timestamp(today) - 86400)
    crud.seed(
        fake_date=datetime(
            month=yesterday.month, day=yesterday.day, year=yesterday.year
        )
    )
    # asyncio.ensure_future(crud.seed(fake_date=datetime(
    # month=8, day=29, year=2020)))
    # time.sleep(360)
    max_date = setup["db"].query(func.max(models.NytLiveCounty.date)).first()
    assert (
        max_date[0].day == (yesterday.day - 1)
        or max_date[0].day == yesterday.day
    )


def test_async_update(setup):
    """
    Tests that the asynchronous update function correctly updates the data
    """
    # Seed old data
    # crud.seed(setup["db"], fake_date=datetime(month=8, day=15, year=2020))
    # crud.seed(fake_date=datetime(month=8, day=29, year=2020))
    # time.sleep(360)

    # Execute a query that causes an async update
    setup["app"].get("/api/data/all")

    # Sleep some time to give update time to work
    time.sleep(120)

    # Check that new max date is today
    today = datetime.now()
    yesterday = datetime.fromtimestamp(datetime.timestamp(today) - 86400)
    max_date = (
        setup["db"].query(func.max(models.NytLiveCounty.date)).first()[0].day
    )

    assert max_date == today.day or max_date == yesterday.day


def test_no_na_fips(setup):
    """
    This function checks that no FIPS entries are NA
    """
    data = json.loads(setup["app"].get("/api/data/all").content)
    county_data = data["data"]["adm2"]
    for county in county_data:
        assert type(county["fips"]) == str
