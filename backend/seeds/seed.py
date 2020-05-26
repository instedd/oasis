import json
from database.database import get_db
from symptoms.models import Symptom

# Using `next` here because get_db() returns a generator
session = next(get_db())

with open('data.json', 'r') as json_data:
  data = json.load(json_data)
  for symptom in data['symptoms']:
    session.add(Symptom(name=symptom['name']))
  session.commit()

session.close()
