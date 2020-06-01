import datetime
import os

from sqlalchemy import Column, DateTime, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{os.environ['DATABASE_USER']}"
    f":{os.environ['DATABASE_PASSWORD']}"
    f"@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


BaseModel = declarative_base()


class Base(BaseModel):
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )
