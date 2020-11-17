from typing import List

from fastapi import Depends, APIRouter, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from starlette.requests import Request
from fastapi.encoders import jsonable_encoder

from database import get_db
from auth import main
from stories import crud, schemas, background


router = APIRouter()


def check_permissions(current_story, story_id):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/", response_model=schemas.Story)
def read_story(current_story: schemas.Story = Depends(main.get_current_story)):
    return current_story


@router.post("/", response_model=schemas.Story)
async def create_story(
    story: schemas.StoryCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    token_data = await main.get_token_if_present(request)

    user = main.get_user_from_token(db, token_data)
    story_to_update = main.get_existing_story(user, token_data, db)

    if story_to_update:
        db_story = crud.update_story(db, story_to_update, story)
    else:
        db_story = crud.create_story(db=db, story=story, user=user)

    jsonStory = jsonable_encoder(schemas.Story.from_orm(db_story))

    # prepare response
    response = JSONResponse(jsonStory, status_code=200)
    if not token_data:
        access_token = main.create_access_token(data={"story_id": db_story.id})
        response.set_cookie(
            "Authorization", value=f"Bearer {access_token}", httponly=True,
        )
    return response


@router.get("/{story_id}/symptoms", response_model=List[schemas.Symptom])
def read_story_symptoms(
    story_id: int,
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return current_story.symptoms


@router.post("/{story_id}/symptoms", response_model=List[schemas.StorySymptom])
def create_story_symptoms(
    story_id: int,
    symptoms: List[schemas.StorySymptomCreate],
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return crud.create_story_symptoms(db, symptoms=symptoms)


@router.post("/{story_id}/travels", response_model=List[schemas.Travel])
def create_travels(
    story_id: int,
    travels: List[schemas.TravelCreate],
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return crud.create_travels(db, travels=travels)


@router.put("/{story_id}/travels", response_model=List[schemas.Travel])
def update_travels(
    story_id: int,
    travels: List[schemas.Travel],
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    return [crud.update_travel(db, travel=travel) for travel in travels]


@router.post("/{story_id}/contacts", response_model=List[schemas.CloseContact])
def create_close_contacts(
    story_id: int,
    close_contacts: List[schemas.CloseContactCreate],
    background_tasks: BackgroundTasks,
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    new_contacts = crud.create_close_contacts(
        db, close_contacts=close_contacts
    )

    background_tasks.add_task(
        background.send_exposure_notification,
        story=current_story,
        contacts=new_contacts,
        db=db,
    )

    return new_contacts


@router.put("/{story_id}/contacts", response_model=List[schemas.CloseContact])
def update_close_contacts(
    story_id: int,
    close_contacts: List[schemas.CloseContact],
    background_tasks: BackgroundTasks,
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    updated_contacts = [
        crud.update_close_contact(db, close_contact=contact)
        for contact in close_contacts
    ]

    background_tasks.add_task(
        background.send_exposure_notification,
        story=current_story,
        contacts=updated_contacts,
        db=db,
    )

    return updated_contacts


@router.get("/all", response_model=List[schemas.Story])
def read_all_stories(db: Session = Depends(get_db)):
    db_stories = crud.get_all_stories(db)

    stories = list(
        map(lambda db_story: jsonable_encoder(db_story), db_stories)
    )

    return JSONResponse(stories, status_code=200)


@router.get("/{story_id}/my_stories", response_model=List[schemas.MyStory])
def read_my_stories(
    story_id: int,
    current_story: schemas.Story = Depends(main.get_current_story),
):
    check_permissions(current_story, story_id)
    return current_story.my_stories


@router.post("/{story_id}/my_stories", response_model=schemas.MyStory)
def create_my_story(
    story_id: int,
    my_story: schemas.MyStoryCreate,
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    check_permissions(current_story, story_id)
    db_my_story = crud.create_my_story(db, my_story=my_story)
    crud.update_latest_my_story(db, current_story, db_my_story.text)

    return db_my_story


@router.get("/my_stories", response_model=List[schemas.MyStory])
def read_all_latest_my_stories(db: Session = Depends(get_db)):
    return crud.get_all_latest_my_stories(db)


@router.get("/my_stories/count")
def get_story_count(db: Session = Depends(get_db)):
    return crud.get_my_story_count(db)


@router.post("/search", response_model=List[schemas.MyStoryWithStory])
def search_my_story(query: schemas.Search, db: Session = Depends(get_db)):
    if len(query.text) == 0:
        raise HTTPException(
            status_code=422,
            detail="Search for empty string is not allowed",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return crud.search_my_story(db, query.text)


@router.get("/explore", response_model=List[schemas.MyStoryWithStory])
def explore(
    current_story: schemas.Story = Depends(main.get_current_story),
    db: Session = Depends(get_db),
):
    if not current_story:
        msg = "User needs to submit a story before user can get a story feed."
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=msg,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return crud.get_story_feed(
        db, current_story.id, current_story.latitude, current_story.longitude
    )


@router.get("/common/{num}/last/{days}")
def get_most_common_words(num: int, days: int, db: Session = Depends(get_db)):
    return crud.get_word_freq(db, num, days)
