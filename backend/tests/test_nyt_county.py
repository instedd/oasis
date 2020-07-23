from NytLiveCounty import crud, models


def test_insert_current_data(setup):
    """
    Tests if the current NYT file can be loaded from github
    """
    crud.update(setup["db"])
    assert len(setup["db"].query(models.NytLiveCounty).all()) > 0
    assert setup["db"].query(models.NytLiveCounty).first().county == "Autauga"
