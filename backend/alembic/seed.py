## README
## Script for seeding data into the development database
## As some entities may require a lot of data, we are keeping a separate file for each entity data

import json
import os

from database import get_db
import users.models
from stories.models import Symptom


SYMPTOMS_FILE='/app/alembic/seed_data/symptoms.json'
session = next(get_db())

for filename in os.listdir("/app/alembic/seed_data"):
  with open(f"/app/alembic/seed_data/{filename}", 'r') as json_data:
    print(f"seeding file {filename}...")
    data = json.load(json_data)
    symptoms = [Symptom(name=s['name']) for s in data['symptoms']]
    session.add_all(symptoms)

session.commit()
session.close()

print('Database seeded successfully')
