from sqlalchemy import Column, Integer, String, Date, DateTime

from database import Base


class NytLiveCounty(Base):
    """
    This class handles the NYT live data from counties which is at
    https://github.com/nytimes/covid-19-data/blob/master/live/us-counties.csv
    """

    __tablename__ = "nyt"
    date = Column(Date)
    county = Column(String(128))
    state = Column(String(128))
    fips = Column(String(128))
    cases = Column(Integer)
    deaths = Column(Integer)
    confirmed_cases = Column(Integer)
    confirmed_deaths = Column(Integer)
    probable_cases = Column(Integer)
    probable_deaths = Column(Integer)
    timestamp = Column(Integer)  # unix time - integer for simplicity
    commit = Column(String(128))  # Commit on NYT github this entry came from


class TimeToLive(Base):
    """
    Specifies the time that NYT data is allowed to stay fresh
    """

    __tablename__ = "nyt_ttl"
    last_updated = Column(DateTime)
    time_to_live = Column(Integer)
