import sqlalchemy
import os
from NytLiveCounty import crud

databases_to_create = ["dbtest", os.environ["DATABASE_NAME"]]

engine = sqlalchemy.create_engine(
    f"mysql+pymysql://{os.environ['DATABASE_USER']}"
    f":{os.environ['DATABASE_PASSWORD']}"
    f"@{os.environ['DATABASE_HOST']}"
)
# Query for existing databases
existing_databases = engine.execute("SHOW DATABASES;")
# Results are a list of single item tuples, so unpack each tuple
existing_databases = [d[0] for d in existing_databases]

for database in databases_to_create:
    if database not in existing_databases:
        engine.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
        print(f"Created database {database} 😎")
    else:
        print(f"Database {database} already exists 🥳")

# Populate NYT database
db = sqlalchemy.orm.sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)
crud.seed()
