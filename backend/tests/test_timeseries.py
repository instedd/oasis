from time_series import crud, models
import time


def test_init_table(setup):
    """
    Tests if the current time series file can be loaded from github
    """
    crud.init_table(setup["db"])
    assert len(setup["db"].query(models.TimeSeries).all()) == 207


def test_update(setup):
    """
    Tests if the can update without repetition
    """
    crud.update(setup["db"])
    assert len(setup["db"].query(models.TimeSeries).all()) == 207
    assert (
        setup["db"]
        .query(models.TimeSeries)
        .order_by(models.TimeSeries.date.desc())
        .first()
        .confirmed
        == 21459699
    )
    assert setup["db"].query(models.TimeSeries).first().recovered == 28


def test_get_n_days(setup):
    """
    Tests if can get lastest n days data
    """

    t0 = time.time()
    ret = crud.get_n_days_data(setup["db"], 14)
    t1 = time.time()
    print(t1 - t0)
    assert len(setup["db"].query(models.TimeSeries).all()) == 207
    assert len(ret) == 14
