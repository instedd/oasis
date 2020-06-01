import {
  LOADING,
  FETCH_SYMPTOMS_START,
  FETCH_SYMPTOMS,
} from "../actions/types";
const initialState = {
  status: {},
  all: [],
  selected: [],
};

const symptoms = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SYMPTOMS_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're fetching all relevant symptoms...",
        },
      };
    case FETCH_SYMPTOMS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default symptoms;
