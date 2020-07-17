import pytest

from sqlalchemy.orm import Session
import alembic.config
from fastapi.testclient import TestClient

from database import Base, engine
from app import app


@pytest.fixture(scope="function")
def setup():
    client = TestClient(app)
    alembic.config.main(argv=["upgrade", "head"])
    session = Session(bind=engine)
    yield {"app": client, "db": session}
    for tbl in reversed(Base.metadata.sorted_tables):
        engine.execute(tbl.delete())
    session.close()
