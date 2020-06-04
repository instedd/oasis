import json
from stories import models


def test_read_symptoms(setup):
    with open("/app/alembic/seed_data/symptoms.json") as seed_data:
        data = json.load(seed_data)
        db_symptoms = [
            models.Symptom(**symptom) for symptom in data["symptoms"]
        ]
        setup["db"].add_all(db_symptoms)
        setup["db"].commit()
        response = setup["app"].get("/api/symptoms")
        assert response.status_code == 200
        for symptom in response.json():
            assert (
                len(
                    [
                        x
                        for x in data["symptoms"]
                        if x["name"] == symptom["name"]
                    ]
                )
                > 0
            )
