import json
from NytLiveCounty import crud, models


def test_insert_current_data(setup):
    """
    Tests if the current NYT file can be loaded from github
    """
    crud.update(setup["db"])
    assert len(setup["db"].query(models.NytLiveCounty).all()) > 0
    assert setup["db"].query(models.NytLiveCounty).first().fips == "01001"


def test_query_counties(setup):
    """
    Tests if the two counties Cook and San Diego can be queried correctly
    """
    response = setup["app"].get("/api/nyt_live_county/17031,06073")
    assert len(json.loads(response.content)) == 2
