import api from "utils";
import history from "../history";
import {
  HANDLE_SICK,
  HANDLE_TESTED,
  SAVED_STORY,
  SAVE_STORY_START,
  SIGN_IN,
  SUCCESS,
} from "./types";

export const submitStory = (dto) => async (dispatch, getState) => {
  const { token } = getState().auth;
  dispatch({ type: SAVE_STORY_START });
  const { story, nextPage } = dto;
  const response = await api(`stories/`, {
    method: "POST",
    body: story,
  });

  dispatch({
    type: SAVED_STORY,
    payload: {
      status: response.error || { type: SUCCESS },
      story: (!response.error && response) || null,
    },
  });

  // if there was no token identifying a user, we need to store the story auth for future data validation
  if (!token)
    dispatch({
      type: SIGN_IN,
      payload: {
        status: { type: SUCCESS },
        token: response && response.token,
      },
    });

  if (!response.error) history.push(nextPage);
};

export function handleSick(option) {
  return (dispatch) => {
    dispatch({
      type: HANDLE_SICK,
      sick: option,
    });
  };
}

export function handleTested(option) {
  return (dispatch) => {
    dispatch({
      type: HANDLE_TESTED,
      tested: option,
    });
  };
}
