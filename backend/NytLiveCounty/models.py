from sqlalchemy import Column, Integer, String, Date

from database import Base

# from database import Base

# class YourCoolModel(Base):
#    __tablename__ = "super_cool_models"
# id = Column(Integer, primary_key=True, index=True)
# all your cool model attributes go here


class NytLiveCounty(Base):
    """
    This class handles the NYT live data from counties which is at
    https://github.com/nytimes/covid-19-data/blob/master/live/us-counties.csv
    """

    __tablename__ = "nyt"
    date = Column(Date)
    county = Column(String)
    state = Column(String)
    fips = Column(Integer)
    cases = Column(Integer)
    deaths = Column(Integer)
    confirmed_cases = Column(Integer)
    confirmed_deaths = Column(Integer)
    probable_cases = Column(Integer)
    probable_deaths = Column(Integer)


class TimeToLive(Base):
    """
    Specifies the time that NYT data is allowed to stay fresh
    """

    __tablename__ = "nyt_ttl"
