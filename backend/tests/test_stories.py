import json
from datetime import date

from stories import models
from auth import main


def test_create_travels_with_no_cookie(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = [
        {
            "story_id": db_story.id,
            "date_of_return": date.today().strftime("%Y-%m-%d"),
            "location": "Argentina",
        }
    ]
    response = setup["app"].post(
        f"/api/stories/{db_story.id}/travels", data=json.dumps(data)
    )
    assert response.status_code == 401


def test_create_travels(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = [
        {
            "story_id": db_story.id,
            "date_of_return": date.today().strftime("%Y-%m-%d"),
            "location": "Argentina",
        }
    ]
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].post(
        f"/api/stories/{db_story.id}/travels",
        data=json.dumps(data),
        cookies=cookie,
        headers=cookie,
    )
    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response[0]:
        if k != "id":
            assert parsed_response[0][k] == data[0][k]


def test_update_travels(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    db_travel = models.Travel(
        story_id=db_story.id,
        location="Bariloche, Argentina",
        date_of_return=date.today(),
    )
    setup["db"].add(db_travel)
    setup["db"].commit()
    data = [
        {
            "id": db_travel.id,
            "story_id": db_story.id,
            "date_of_return": date.today().strftime("%Y-%m-%d"),
            "location": "Argentina",
        }
    ]
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].put(
        f"/api/stories/{db_story.id}/travels",
        data=json.dumps(data),
        cookies=cookie,
        headers=cookie,
    )
    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response[0]:
        assert parsed_response[0][k] == data[0][k]
