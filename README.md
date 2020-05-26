# oasis
UCSD Oasis platform

## Local project setup

1. Install [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone the project and go to the project folder in your console
3. Run `./dev-setup` to build the project
4. To run the app: `docker-compose up` - navigate to http://localhost:3000 to see it! 🚀
    - All API endpoints are available in `http://localhost:8000/api/{endpoint-name-here}`

### Creating new backend apps with models

If you're creating an app on the backend and it contains models, you'll need to set up a couple of things to make sure migrations work. To begin with, in your app's `models.py` make sure to import the app's declarative base and creating your models based off that:

```python
from database.database import Base

class YourCoolModel(Base):
    __tablename__ = "super_cool_models"
    id = Column(Integer, primary_key=True, index=True)
    # all your cool model attributes go here
```

After that, head over to `alembic.env` and import your models on the top section of the file:

```python
from users import models
from yourcoolapp import models
```

That's about it! Migrations should auto-generate correctly with that set up!

### Generating & running migrations

As part of our everyday work, data models may change from time to time. When you change a model in the backend, make sure to run the following code to generate any necessary Alembic migrations:

```python
docker-compose run api alembic revision --autogenerate -m "Migration name here!"
```

When possible, keep the migration name descriptive!

When a new migration file is available, apply it by running

```
./dev-setup
```
If you want to run them manually you can also do:

```python
docker-compose run api alembic upgrade head
```

You can also roll back migrations by doing

```python
docker-compose run api alembic downgrade
```

### Seeding data

To populate development database with seed data, which is located in `/backend/database/seed_data` directory, run:

```
docker-compose run --rm api python database/seed.py
```

To add seed data or modify existing one, apply changes in `<entity>.json` file for the target entity in aforementioned `/backend/database/seed_data` directory.

## Building & deploying

### Frontend

1. Move to the `frontend` folder of the project
2. Build the app with `yarn build`
3. Deploy to firebase with `firebase deploy`
