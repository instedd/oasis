from database import Base
from sqlalchemy import Column, Integer, Date, DateTime


class TimeSeries(Base):
    """
    This class takes confirmed,recovered and deaths from corresponding files
    https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv
    https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv
    https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv
    """

    __tablename__ = "time_series"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    confirmed = Column(Integer)
    recovered = Column(Integer)
    deaths = Column(Integer)


class TimeToLive(Base):
    """
    Specifies the time that time series data is allowed to stay fresh
    """

    __tablename__ = "timeseries_ttl"
    last_updated = Column(DateTime)
    time_to_live = Column(Integer)
