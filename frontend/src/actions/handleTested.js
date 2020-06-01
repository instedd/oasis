import { HANDLE_TESTED } from "./types";

export function handleTested(option) {
  return function (dispatch) {
    dispatch({
      type: HANDLE_TESTED,
      tested: option,
    });
  };
}
