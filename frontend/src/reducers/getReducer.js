import { GET_OVERALL } from "../actions/types";
const initialState = {
  overall: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_OVERALL:
      return {
        ...state,
        overall: action.data,
      };

    default:
      return state;
  }
}
