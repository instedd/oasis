#!/bin/sh

# set up precommit hooks (this actually needs to happen outside of docker!)
yarn add pre-commit
/Applications/Python\ 2.7/Install\ Certificates.command
pre-commit install -f

# lift & update containers
docker-compose build
docker-compose run --rm api pip install -r requirements.txt
docker-compose run --rm ui yarn
docker-compose run --rm api alembic upgrade head
