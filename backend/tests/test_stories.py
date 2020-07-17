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
    print(setup["db"].execute("SELECT * FROM stories", {}).rowcount)
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


def test_create_close_contacts_with_no_cookie(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = [
        {
            "story_id": db_story.id,
            "email": "foo@bar.com",
            "phone_number": "1122334455",
        }
    ]
    response = setup["app"].post(
        f"/api/stories/{db_story.id}/contacts", data=json.dumps(data)
    )
    assert response.status_code == 401


def test_create_close_contacts(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = [
        {
            "story_id": db_story.id,
            "email": "foo@bar.com",
            "phone_number": "1122334455",
        }
    ]
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].post(
        f"/api/stories/{db_story.id}/contacts",
        data=json.dumps(data),
        cookies=cookie,
        headers=cookie,
    )
    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response[0]:
        if k != "id":
            assert parsed_response[0][k] == data[0][k]


def test_update_close_contacts(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    db_contact = models.CloseContact(
        story_id=db_story.id, email="foo@bar.com", phone_number="1122334455",
    )
    setup["db"].add(db_contact)
    setup["db"].commit()
    data = [
        {
            "id": db_contact.id,
            "story_id": db_story.id,
            "email": "test@foobar.com",
            "phone_number": "9988776655",
        }
    ]
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].put(
        f"/api/stories/{db_story.id}/contacts",
        data=json.dumps(data),
        cookies=cookie,
        headers=cookie,
    )
    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response[0]:
        assert parsed_response[0][k] == data[0][k]


def test_read_random_story(setup):
    db_stories = [
        models.Story(
            id=i,
            city="city" + str(i),
            country="country" + str(i % 5),
            state="state" + str(i % 10),
            my_story=str(i),
            _medical_conditions="[]",
            sick="not_sick",
            tested="not_tested",
        )
        for i in range(100)
    ]
    setup["db"].add_all(db_stories)
    setup["db"].commit()

    response = setup["app"].get("/api/stories/random/country/2")

    assert response.status_code == 200
    parsed_response = response.json()
    assert len(parsed_response) == 10

    for story in parsed_response:
        assert "country" + str(story["id"] % 5) == story["country"]

    parsed_response = setup["app"].get("/api/stories/random/city/2").json()
    assert len(parsed_response) == 100

    parsed_response = setup["app"].get("/api/stories/random/state/5").json()
    assert len(parsed_response) == 50
