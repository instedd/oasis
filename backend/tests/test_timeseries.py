from time_series import crud, models


def test_init_current_data(setup):
    """
    Tests if the current time series file can be loaded from github
    """
    crud.init_table(setup["db"])
    assert len(setup["db"].query(models.TimeSeries).all()) == 14
