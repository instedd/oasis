import { HANDLE_SICK, SET_STORY } from "./types";

export function handleSick(option) {
  return function (dispatch) {
    dispatch({
      type: HANDLE_SICK,
      sick: option,
    });
  };
}

export function setStory(story) {
  return function (dispatch) {
    dispatch({
      type: SET_STORY,
      payload: story,
    });
  };
}
