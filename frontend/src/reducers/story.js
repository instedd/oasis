import {
  SET_SICK_STATUS,
  SET_TESTED_STATUS,
  LOADING,
  SET_STORY,
  SAVED_STORY,
  SAVE_STORY_START,
  FETCH_STORY_START,
  FETCH_STORY,
  INVALID_STORY,
  SUBMIT_TRAVELS_START,
  SUBMIT_TRAVELS,
  SUBMIT_CLOSE_CONTACTS,
  SUBMIT_CLOSE_CONTACTS_START,
  SET_MY_STORY,
  SUBMIT_MY_STORY,
} from "../actions/types";

const initialState = {
  status: {},
  story: null,
  travels: [],
  closeContacts: [],
  tempMyStory: "",
  tempStory: null,
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
    case SET_STORY:
      return {
        ...state,
        tempStory: action.payload,
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
    case SUBMIT_MY_STORY:
      return {
        ...state,
        tempMyStory: null,
        story: {
          ...state.story,
          latestMyStory: action.payload.latestMyStory,
        },
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
        ...action.payload,
      };
    case SUBMIT_CLOSE_CONTACTS_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're saving your close contacts info...",
        },
      };
    case SUBMIT_CLOSE_CONTACTS:
      return {
        ...state,
        ...action.payload,
      };
    case INVALID_STORY:
      return {
        ...state,
        ...action.payload,
      };
    case SET_MY_STORY:
      return {
        ...state,
        tempMyStory: action.payload,
      };
    default:
      return state;
  }
};

export default story;
