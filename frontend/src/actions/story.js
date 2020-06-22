import { sicknessStatus, testStatus } from "routes/types";
import api from "utils";
import history from "../history";
import {
  SET_SICK_STATUS,
  SET_TESTED_STATUS,
  SAVED_STORY,
  SAVE_STORY_START,
  SUCCESS,
  FETCH_STORY_START,
  FETCH_STORY,
  INVALID_STORY,
  ERROR,
} from "./types";
import { fields } from "../routes/CriticalQuestions/fields";

const mandatoryFields = [fields.CURRENT_LOCATION];

const isValidStory = (dto) => invalidFields(dto.story).length === 0;

const invalidFields = (dto) =>
  mandatoryFields.filter((field) => !(field.key in dto && dto[field.key]));

export const submitStory = (dto) => async (dispatch) => {
  if (!isValidStory(dto)) {
    return dispatch({
      type: INVALID_STORY,
      payload: {
        status: {
          type: ERROR,
          detail: `Please complete the following fields: ${invalidFields(dto)
            .map((field) => field.label)
            .join(", ")}`,
        },
      },
    });
  }

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

  if (!response.error) history.push(nextPage);
};

export const setSickStatus = (option) => (dispatch) => {
  dispatch({
    type: SET_SICK_STATUS,
    payload: option,
  });
};

export const setTestedStatus = (option) => (dispatch) => {
  dispatch({
    type: SET_TESTED_STATUS,
    payload: option,
  });
};

export const fetchStory = () => async (dispatch) => {
  await getCurrentStory(dispatch);
};

export const getCurrentStory = async (dispatch) => {
  dispatch({ type: FETCH_STORY_START });
  const response = await api("stories/");

  dispatch({
    type: FETCH_STORY,
    payload: {
      status: response.error || { type: SUCCESS },
      story: (!response.error && response) || null,
    },
  });
  return response;
};
