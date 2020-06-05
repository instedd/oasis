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

const submitTravels = (travels, storyId, nextPage) => async (dispatch) => {
  dispatch({ type: SUBMIT_TRAVELS_START });
  let parsedTravels = travels.map((travel) => ({ ...travel, storyId }));
  const response = await api(`stories/${storyId}/travels`, {
    method: "POST",
    body: parsedTravels,
  });

  dispatch({
    type: SUBMIT_TRAVELS,
    payload: {
      status: response.error || { type: SUCCESS },
      story: (!response.error && response) || null,
    },
  });

  if (!response.error) history.push(nextPage);
};

export const getStorySuggestions = (story) => {
  const suggestions = [];
  if (story.age > 64 || story.medicalConditions.length)
    suggestions.push({
      site:
        "https://www.cdc.gov/coronavirus/2019-ncov/need-extra-precautions/people-at-higher-risk.html",
      text: "Information for people in higher risk",
    });

  if (story.sick === sicknessStatus.SICK)
    suggestions.push({
      site: "https://earth2-covid.ucsd.edu/homebound",
      color: "#2D9CDB",
      text: "Download HomeBound",
    });

  let clinicalTrialsLink = "https://clinicaltrials.gov/ct2/who_table";
  if (story && story.profession === "Healthcare")
    clinicalTrialsLink = "https://heroesresearch.org";
  if (story && story.currentLocation === "United States of America")
    clinicalTrialsLink =
      "https://www.niaid.nih.gov/diseases-conditions/covid-19-clinical-research";
  suggestions.push({
    site: clinicalTrialsLink,
    color: "#F2C94C",
    text: "Join a clinical trial",
  });

  if (
    story.sick === sicknessStatus.RECOVERED &&
    story.tested === testStatus.POSITIVE
  )
    suggestions.push({
      site:
        "https://www.redcrossblood.org/donate-blood/dlp/plasma-donations-from-recovered-covid-19-patients.html#donorform",
      color: "#EB5757",
      text: "Donate your blood to help others",
    });

  suggestions.push({
    site: "https://coronavirus.gov",
    text: "More information about COVID-19",
  });

  if (story.countryOfOrigin === "United States of America") {
    if (story.currentLocation === "Mexico")
      suggestions.push({
        site:
          "https://mx.usembassy.gov/u-s-citizen-services/covid-19-information/",
        text: "Information for US Citizens",
      });
    else if (story.currentLocation !== "United States of America")
      suggestions.push({
        site:
          "https://travel.state.gov/content/travel/en/international-travel/emergencies/what-state-dept-can-cant-do-crisis.html",
        text: "Information for US Citizens",
      });
  }

  if (
    story.sick === sicknessStatus.RECOVERED ||
    story.sick === sicknessStatus.SICK
  )
    suggestions.push({
      site:
        "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
      text: "Check your symptoms",
    });

  return suggestions;
};
