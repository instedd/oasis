import { ERROR } from "actions/types";
import paths from "routes/paths";
import history from "./history";

const api = async (path, payload = {}, explicitBody = false) => {
  const fullPayload = {
    method: "GET",
    credentials: "include",
    ...payload,
    headers: {
      "Content-Type": "application/json",
      ...payload.headers,
    },
  };
  if (payload.body) {
    fullPayload.body = explicitBody
      ? payload.body
      : JSON.stringify(
          Array.isArray(payload.body)
            ? payload.body.map((obj) => parseObjectKeys(obj, camelToSnakeCase))
            : parseObjectKeys(payload.body || {}, camelToSnakeCase)
        );
  }

  let response = await fetch(
    `${
      process.env.REACT_APP_API || `https://${window.location.host}`
    }/api/${path}`,
    fullPayload
  );
  if (response.status === 401) history.push(paths.signIn);
  // if everything was correct, process data
  if (response.status >= 200 && response.status < 300) {
    response = await response.json();
    if (Array.isArray(response))
      return response.map((element) =>
        parseObjectKeys(element, snakeToCamelCase)
      );
    return parseObjectKeys(response, snakeToCamelCase);
  }

  // if we had a known error, return the proper status
  const body = await response.json();
  return {
    error: {
      code: response.status,
      type: ERROR,
      detail: body.detail || "Unknown error! Please try again",
    },
  };
};

export const parseObjectKeys = (object, method) =>
  Object.keys(object).reduce((acc, key) => {
    if (Array.isArray(object[key])) {
      acc[method(key)] = object[key].map((element) =>
        typeof element === "object" && element !== null
          ? parseObjectKeys(element, method)
          : element
      );
    } else {
      acc[method(key)] = object[key];
    }
    return acc;
  }, {});

export const snakeToCamelCase = (str) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );

const camelToSnakeCase = (str) => str.replace(/([A-Z])/g, "_$1").toLowerCase();

export const getGeocoding = (city, state, country) => {
  const MAPBOX_APIKEY =
    "pk.eyJ1IjoieXVzMjUyIiwiYSI6ImNrYTZhM2VlcjA2M2UzMm1uOWh5YXhvdGoifQ.ZIzOiYbBfwJsV168m42iFg";

  const query = city + " " + state + " " + country;
  const url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    query +
    ".json?access_token=" +
    MAPBOX_APIKEY;
  return fetch(url)
    .then((response) => response.json())
    .then((jsondata) => {
      if (
        jsondata &&
        jsondata.features &&
        jsondata.features.length &&
        jsondata.features[0].geometry &&
        jsondata.features[0].geometry.coordinates &&
        jsondata.features[0].geometry.coordinates.length >= 2
      ) {
        return jsondata.features[0].geometry.coordinates;
      }
    });
};

export default api;
