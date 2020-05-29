import os
from sqlalchemy import create_engine
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
