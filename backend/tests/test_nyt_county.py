import json

from NytLiveCounty import crud, models
from datetime import datetime
import time
from sqlalchemy import func


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
    crud.seed(setup["db"], fake_date=datetime(month=8, day=15, year=2020))
    max_date = setup["db"].query(func.max(models.NytLiveCounty.date)).first()
    assert max_date[0].day == 14  # 14 because newest data before 8/15 at 12am


def test_async_update(setup):
    """
    Tests that the asynchronous update function correctly updates the data
    """
    # Seed old data
    crud.seed(setup["db"], fake_date=datetime(month=8, day=15, year=2020))

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


# For the old NYT API - probably don't want to use
'''
def test_empty_query(setup):
    """
    Tests that the result for an empty query is empty
    """
    # crud.update(setup["db"])
    response = setup["app"].get("/api/nyt_live_county/ ")
    print(type(json.loads(response.content)))
    assert len(json.loads(response.content)) == 0


def test_data_window(setup):
    # crud.seed(setup["db"])

    THIRTEEN_DAYS_AGO = time.time() - (60 * 60 * 24 * 13)
    FIFTEEN_DAYS_AGO = time.time() - (60 * 60 * 24 * 15)

    min_ts = setup["db"].query(func.min(models.NytLiveCounty.timestamp)).one()

    assert min_ts[0] < THIRTEEN_DAYS_AGO
    assert min_ts[0] > FIFTEEN_DAYS_AGO
'''
