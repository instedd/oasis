from fastapi import Depends, FastAPI, APIRouter, HTTPException, Header, status
from sqlalchemy.orm import Session

from stories import crud, models, schemas
from users.crud import get_token_data, oauth2_scheme, get_user_by_email
from database.database import get_db

router = APIRouter()


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


@router.post("/", response_model=schemas.Story)
async def create_story(story: schemas.CreateStory, db: Session = Depends(get_db), authorization: str = Header(None)):
    token_data = await get_token_data(authorization[7:]) if authorization is not None else None
    return crud.create_story(db=db, story=story, token_data=token_data)

@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, current_story: schemas.Story = Depends(get_current_story)):
    if current_story.id != story_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You don't have access to that story",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_story
