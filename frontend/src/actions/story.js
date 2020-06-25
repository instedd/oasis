import api, { snakeToCamelCase, parseObjectKeys } from "utils";
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
  SUBMIT_TRAVELS_START,
  SUBMIT_TRAVELS,
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
  const { story, nextPage, travels } = dto;
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

  if (!response.error) {
    if (travels.length) dispatch(submitTravels(travels, response.id, nextPage));
    else history.push(nextPage);
  }
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
  const { error, travels, ...story } = await api("stories/");

  dispatch({
    type: FETCH_STORY,
    payload: {
      status: error || { type: SUCCESS },
      story: (!error && story) || null,
      travels:
        (!error &&
          travels.map((travel) => parseObjectKeys(travel, snakeToCamelCase))) ||
        [],
    },
  });
  return story;
};

const submitTravels = (travels, storyId, nextPage) => async (dispatch) => {
  dispatch({ type: SUBMIT_TRAVELS_START });
  let parsedTravels = travels.map((travel) => ({ ...travel, storyId }));
  const newTravels = parsedTravels.filter((travel) => !("id" in travel));
  const updatedTravels = parsedTravels.filter((travel) => "id" in travel);
  const postResponse = await api(`stories/${storyId}/travels`, {
    method: "POST",
    body: newTravels,
  });
  const putResponse = await api(`stories/${storyId}/travels`, {
    method: "PUT",
    body: updatedTravels,
  });

  const errors = postResponse.error || putResponse.error;
  const responseTravels = (postResponse.travels || []).concat(
    putResponse.travels || []
  );
  dispatch({
    type: SUBMIT_TRAVELS,
    payload: {
      status: errors || { type: SUCCESS },
      travels: (!errors && responseTravels) || null,
    },
  });

  if (!errors) history.push(nextPage);
};
