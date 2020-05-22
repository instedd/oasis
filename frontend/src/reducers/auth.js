import { SIGN_UP, SIGN_UP_START, LOADING } from '../actions/types';
const initialState = {
  status: {},
  user: null,
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
    default:
      return state;
  }
}

export default auth;
