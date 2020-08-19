import pytest

from sqlalchemy.orm import Session

# import alembic.config
from fastapi.testclient import TestClient

from database import Base, engine
from app import app

# Uncomment this to test NYT county data
# from NytLiveCounty.crud import seed


@pytest.fixture(scope="module")
def setup():
    client = TestClient(app)
    session = Session(bind=engine)
    # seed(session)  # Uncomment me to test NYT county data
    yield {"app": client, "db": session}
    for tbl in reversed(Base.metadata.sorted_tables):
        engine.execute(tbl.delete())
    session.close()
