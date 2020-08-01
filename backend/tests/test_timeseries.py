from time_series import crud, models


def test_init_table(setup):
    """
    Tests if the current time series file can be loaded from github
    """
    crud.update(setup["db"])
    assert len(setup["db"].query(models.TimeSeries).all()) == 192


def test_update(setup):
    """
    Tests if the can update without repetition
    """
    crud.update(setup["db"])
    assert len(setup["db"].query(models.TimeSeries).all()) == 192
    assert (
        setup["db"]
        .query(models.TimeSeries)
        .order_by(models.TimeSeries.date.desc())
        .first()
        .confirmed
        == 17591968
    )
    assert setup["db"].query(models.TimeSeries).first().recovered == 28


def test_get_n_days(setup):
    """
    Tests if can get lastest n days data
    """

    ret = crud.get_n_days_data(setup["db"], 14)
    assert len(ret) == 14
