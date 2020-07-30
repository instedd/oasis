#!/bin/sh

# set up precommit hooks (this actually needs to happen outside of docker!)
pip install pre-commit
/Applications/Python\ 2.7/Install\ Certificates.command
pre-commit install -f

# lift & update containers
docker-compose.exe build
docker-compose.exe run --rm api pip install -r requirements.txt
docker-compose.exe run --rm api pip install -r requirements.dev.txt
docker-compose.exe run --rm api python init_db.py
docker-compose.exe run --rm ui yarn
docker-compose.exe run --rm api alembic upgrade head
