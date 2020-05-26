import { SIGN_UP, SIGN_UP_START, SIGN_IN, SIGN_IN_START, LOADING } from '../actions/types';
const initialState = {
  status: {},
  user: null,
  token: null,
}

const auth = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_UP_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're creating your account..."
        }
      };
    case SIGN_UP:
      return {
        ...state,
        ...action.payload
      };
    case SIGN_IN_START:
      return {
        ...state,
        status: {
          type: LOADING,
          detail: "We're checking your credentials..."
        }
      };
    case SIGN_IN:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

export default auth;
