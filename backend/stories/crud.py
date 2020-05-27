import json

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from users.crud import get_user_by_email, oauth2_scheme, get_token_data, create_access_token
from users.schemas import TokenData
from users.models import User
from . import models, schemas


def get_story(db: Session, story_id: int):
    db_story = db.query(models.Story).filter(models.Story.id == story_id).first()
    return db_story



def create_story(db: Session, story: schemas.CreateStory, token_data: str):
    # if the story was submitted with an auth token, we want to associate it to the token's user
    if token_data:
        user = get_user_by_email(db, email=token_data.email)
    
    if user and user.story:
        # if the user already had a story, we need to update it.
        story_as_dict = dict(story)
        modified_story = {k: story_as_dict[k] for k in story_as_dict if k in models.Story.__table__.columns}
        db.query(models.Story).filter(models.Story.id==user.story.id).update(modified_story)
        db_story = db.query(models.Story).filter(models.Story.id == user.story.id).first()
    else:
        db_story = models.Story(**story.dict())
        db.add(db_story)
    db.commit()
    db.refresh(db_story)

    # if the story was submitted with an auth token, we want to associate it to the token's user
    if user and not user.story:
        db.query(User).filter(User.id==user.id).update({"story_id": db_story.id})
        db.commit()
        db.refresh(db_story)

    new_story = schemas.Story.from_module(db_story)
    new_story.token = create_access_token(
        data={"story_id": db_story.id}, expires_delta=timedelta(days=5)
    )
    return new_story

# demands that an endpoint has a token
# demands that the token is associated to an user that has a story, or a story
async def get_current_story(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = await get_token_data(token=token)
    if token_data is None:
        raise credentials_exception
    user = get_user_by_email(db, email=token_data.email)
    story = get_story(db, story_id=token_data.story_id) if token_data.story_id else None
    if not story:
        if not (user and user.story): # no story nor user match the token data
            raise HTTPException(status_code=404, detail="Story not found")
        else: # there's a user with a story
            return schemas.Story.from_module(user.story)
    if not user: # the token has no user data, so we're operating anonymously. That's ok!
        return story
    elif user.story.id != story.id: # there's user data in the token but it doesn't match the story data
        raise credentials_exception
    # there's user data and it matches user data
    return story
