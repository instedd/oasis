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
import { getCurrentStory } from "./story";

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

export const signIn = (loginDTO) => async (dispatch) => {
  dispatch({ type: SIGN_IN_START });
  const response = await api(
    `auth`,
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
    const story = await getCurrentStory(dispatch);
    console.log("This story is ");
    console.log(story);
    if (!story || Object.entries(story).length === 0 || story.error) {
      history.push(paths.onboard);
      console.log("Go to onboard");
    } else {
      history.push(paths.dashboard);
      console.log("Go to dashboard");
    }
  }
};
