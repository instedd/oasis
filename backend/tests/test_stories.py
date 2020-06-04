import json
from datetime import date

from stories import models
from auth import main


def test_create_travels(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = {
        "story_id": db_story.id,
        "date_of_return": date.today().strftime("%Y-%m-%d"),
        "location": "Argentina",
    }
    access_token = main.create_access_token(data={"story_id": db_story.id})
    response = setup["app"].post(
        f"/api/{db_story.id}/travels",
        data=json.dumps(data),
        cookies={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    parsed_response = response.json()
    assert parsed_response["location"] == data["location"]
