## README
## Script for seeding data into the development database
## As some entities may require a lot of data, we are keeping a separate file for each entity data

import json
from database import get_db
from symptoms.models import Symptom

SYMPTOMS_FILE='/app/database/seed_data/symptoms.json'
session = next(get_db())

with open(SYMPTOMS_FILE, 'r') as json_data:
  data = json.load(json_data)
  for symptom in data['symptoms']:
    session.add(Symptom(name=symptom['name']))

session.commit()
session.close()

print('Database seeded successfully')
