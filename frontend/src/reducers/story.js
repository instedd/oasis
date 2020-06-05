import {
  SET_SICK_STATUS,
  SET_TESTED_STATUS,
  LOADING,
  SAVED_STORY,
  SAVE_STORY_START,
  FETCH_STORY_START,
  FETCH_STORY,
  INVALID_STORY,
  SUBMIT_TRAVELS_START,
  SUBMIT_TRAVELS,
} from "../actions/types";

const initialState = {
  status: {},
  story: null,
  travels: [],
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
      return {
        ...state,
        ...action.payload,
      };
    case SET_SICK_STATUS:
      return {
        ...state,
        story: { ...state.story, sick: action.payload },
      };
    case SET_TESTED_STATUS:
      return {
        ...state,
        story: { ...state.story, tested: action.payload },
      };
    case FETCH_STORY_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're finding your story...",
        },
      };
    case FETCH_STORY:
      return { ...state, ...action.payload };
    case SUBMIT_TRAVELS_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're saving your travel info...",
        },
      };
    case SUBMIT_TRAVELS:
      return {
        ...state,
        travels: action.payload,
      };
    case INVALID_STORY:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default story;
