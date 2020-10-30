import {
  SIGN_UP,
  SIGN_IN,
  SUCCESS,
  SIGN_UP_START,
  SIGN_IN_START,
} from "./types";
import api from "utils";
import history from "../history";
import paths from "routes/paths";

export const signUp = (userDTO) => async (dispatch) => {
  dispatch({ type: SIGN_UP_START });
  const response = await api(`users`, {
    method: "POST",
    body: userDTO,
  });
  dispatch({
    type: SIGN_UP,
    payload: {
      status: response.error || { type: SUCCESS },
      user: (!response.error && response) || null,
    },
  });

  if (!response.error) history.push(paths.signIn);
};

export const signIn = (loginDTO, external = false) => async (dispatch) => {
  dispatch({ type: SIGN_IN_START });
  const response = await api(
    external ? `auth/external` : `auth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(loginDTO.email)}&password=${
        loginDTO.password
      }`,
    },
    true
  );
  dispatch({
    type: SIGN_IN,
    payload: {
      status: response.error || { type: SUCCESS },
    },
  });

  if (!response.error) {
    // const story = await getCurrentStory(dispatch);
    // if (!story || Object.entries(story).length === 0 || story.error) {
    //   history.push(paths.onboard, { onboard: false });
    // } else {
    //   history.push(paths.dashboard);
    // }
    history.push(paths.dashboard);
  }
};
