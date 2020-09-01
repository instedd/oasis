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


def test_create_my_story_with_no_cookie(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = {
        "story_id": db_story.id,
        "text": "A test my story",
    }

    response = setup["app"].post(
        f"/api/stories/{db_story.id}/my_stories", data=json.dumps(data)
    )
    assert response.status_code == 401


def test_create_my_story(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    data = {
        "story_id": db_story.id,
        "text": "A test my story",
    }

    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].post(
        f"/api/stories/{db_story.id}/my_stories",
        data=json.dumps(data),
        cookies=cookie,
        headers=cookie,
    )
    print(response.reason)
    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response:
        if k != "id" and k != "updated_at" and k != "created_at":
            assert parsed_response[k] == data[k]


def test_update_my_story(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    db_my_story = models.MyStory(story_id=db_story.id, text="Old my story",)
    setup["db"].add(db_my_story)
    setup["db"].commit()
    data = {
        "id": db_my_story.id,
        "story_id": db_story.id,
        "text": "New my story",
    }
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].put(
        f"/api/stories/{db_story.id}/my_stories",
        data=json.dumps(data, indent=4, sort_keys=True, default=str),
        cookies=cookie,
        headers=cookie,
    )

    assert response.status_code == 200
    parsed_response = response.json()
    for k in parsed_response:
        if k != "updated_at" and k != "created_at":
            assert parsed_response[k] == data[k]


def test_delete_my_story(setup):
    db_story = models.Story()
    setup["db"].add(db_story)
    setup["db"].commit()
    db_my_story = models.MyStory(story_id=db_story.id, text="Old my story",)
    setup["db"].add(db_my_story)
    setup["db"].commit()
    access_token = main.create_access_token(data={"story_id": db_story.id})
    cookie = {"Authorization": f"Bearer {access_token}"}
    response = setup["app"].delete(
        f"/api/stories/{db_story.id}/my_stories/{db_my_story.id}",
        cookies=cookie,
        headers=cookie,
    )

    assert response.status_code == 200

    response = setup["app"].delete(
        f"/api/stories/{db_story.id}/my_stories/{db_my_story.id+500}",
        cookies=cookie,
        headers=cookie,
    )

    assert response.status_code == 404
