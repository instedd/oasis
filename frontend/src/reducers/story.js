import {
  HANDLE_SICK,
  HANDLE_TESTED,
  LOADING,
  SAVED_STORY,
  SAVE_STORY_START,
} from "../actions/types";

const initialState = {
  status: {},
  sick: null,
  tested: null,
  story: null,
};

const story = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_STORY_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're saving your story...",
        },
      };
    case SAVED_STORY:
      const savedStory = action.payload.story;
      return {
        ...state,
        story: {
          ...savedStory,
        },
      };
    case HANDLE_SICK:
      return {
        ...state,
        sick: action.sick,
      };
    case HANDLE_TESTED:
      return {
        ...state,
        tested: action.tested,
      };
    default:
      return state;
  }
};

export default story;
