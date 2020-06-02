import { sicknessStatus, testStatus } from "routes/types";
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

  return suggestions;
};
