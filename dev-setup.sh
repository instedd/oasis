#!/bin/sh
docker-compose build
docker-compose run --rm api pip install -r requirements.txt
docker-compose run --rm ui yarn
docker-compose run --rm api alembic upgrade head
