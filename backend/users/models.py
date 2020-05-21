from sqlalchemy import Column, ForeignKey, Integer, String

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(128), unique=True, index=True)
    password = Column(String(128))
    username = Column(String(64), unique=True)