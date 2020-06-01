# oasis
[![Build Status](https://travis-ci.org/instedd/oasis.svg?branch=master)](https://travis-ci.org/instedd/oasis)
UCSD Oasis platform

## Local project setup

1. Install [Docker Compose](https://docs.docker.com/compose/install/) and [Yarn](https://yarnpkg.com/getting-started/install) globally
2. Clone the project and go to the project folder in your console
3. Run `./dev-setup` to build the project
    - **Tip:** Make sure to run this command regularly, or at least, every time you start something fresh from `master`!
4. To run the app: `docker-compose up` - navigate to http://localhost:3000 to see it! 🚀
    - All API endpoints are available in `http://localhost:8000/api/{endpoint-name-here}`

### Adding packages to the frontend

If you need to add packages to the frontend app, make sure to do so with yarn and within the docker environment:

```zsh
docker-compose run --rm ui yarn add PACKAGE_NAME_HERE 
```

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
docker-compose run api alembic downgrade -1
```

## Building & deploying

Builds are generated automatically whenever we:

- Push to `master` (updates the `dev` image)
- Push to a branch named `release/something` (updates an image called `release/something-dev`)
- Tag the project (generates a `tag-name` image)

After doing any of these actions, you can head over to [Travis](https://travis-ci.org/github/instedd/oasis) to see  how the build is faring.

With the build ready, head over to [Rancher](https://rancher.instedd.org/) to upgrade the Oasis instances in the environment you need to deploy to. Make sure to add any necessary **environment variables** while you're upgrading and run any **migrations** afterwards!
