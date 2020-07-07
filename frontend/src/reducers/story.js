import {
  SET_SICK_STATUS,
  SET_TESTED_STATUS,
  SET_ONBOARD_STATUS,
  LOADING,
  SAVED_STORY,
  SAVE_STORY_START,
  FETCH_STORY_START,
  FETCH_STORY,
  INVALID_STORY,
  SUBMIT_TRAVELS_START,
  SUBMIT_TRAVELS,
  SUBMIT_CLOSE_CONTACTS,
  SUBMIT_CLOSE_CONTACTS_START,
} from "../actions/types";

const initialState = {
  status: {},
  story: null,
  travels: [],
  closeContacts: [],
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
    case SET_ONBOARD_STATUS:
      return {
        ...state,
        story: { ...state.story, onboard: action.payload },
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
    default:
      return state;
  }
};

export default story;
