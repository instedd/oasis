# oasis
UCSD Oasis platform

## Local project setup

1. Install [Docker Compose](https://docs.docker.com/compose/install/)
2. Clone the project and go to the project folder in your console
3. Run `docker-compose up` to build & lift the project - navigate to http://localhost:3000 to see it! 🚀
    - All API endpoints are available in `http://localhost:8000/api/{endpoint-name-here}`

### Generating & running migrations

As part of our everyday work, data models may change from time to time. When you change a model in the backend, make sure to run the following code to generate any necessary Alembic migrations:

```python
docker-compose run api alembic revision --autogenerate -m "Migration name here!"
```

When possible, keep the migration name descriptive!

Migrations will be run automatically when lifting the `api` container, but if you want to run them manually you can do:

```python
docker-compose run api alembic 
```

## Building & deploying

### Frontend

1. Move to the `frontend` folder of the project
2. Build the app with `yarn build`
3. Deploy to firebase with `firebase deploy`

Development Mode: 
1. Move to the `frontend` folder of the project
2. Run `yarn start`