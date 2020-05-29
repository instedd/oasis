## README
## Script for seeding data into the development database
## As some entities may require a lot of data, we are keeping a separate file for each entity data

## TODO: Fix imports. They're broken because they don't work in the same context as the api
import json
from database import get_db
import users.models
from stories.models import Symptom

SYMPTOMS_FILE='/app/alembic/seed_data/symptoms.json'
session = next(get_db())

with open(SYMPTOMS_FILE, 'r') as json_data:
  data = json.load(json_data)
  symptoms = [Symptom(name=s['name']) for s in data['symptoms']]
  session.add_all(symptoms)

session.commit()
session.close()

print('Database seeded successfully')
