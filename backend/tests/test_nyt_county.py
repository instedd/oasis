import json

# from NytLiveCounty import models
# import time
# from sqlalchemy import func


def test_query_counties(setup):
    """
    Tests if the two counties Cook and San Diego can be queried correctly
    """
    response = setup["app"].get("/api/data/county")
    assert len(json.loads(response.content)["clusters"]) == 5


def test_query_all_data(setup):
    """
    Test intergration of NYT data with data/all
    """
    response = setup["app"].get("/api/data/all")
    assert len(json.loads(response.content)["clusters"]) == 5


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
