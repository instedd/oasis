import { ERROR } from "actions/types";
import paths from "routes/paths";
import history from "./history";
import store from "store/configureStore";

const api = async (path, payload = {}, explicitBody = false) => {
  const { auth } = await store.getState();
  const fullPayload = {
    method: "GET",
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

  if (auth && auth.token)
    fullPayload.headers["Authorization"] = `Bearer ${auth.token}`;

  let response = await fetch(
    `${process.env.REACT_APP_API || ""}/api/${path}`,
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

const parseObjectKeys = (object, method) =>
  Object.keys(object).reduce((acc, key) => {
    acc[method(key)] = object[key];
    return acc;
  }, {});

const snakeToCamelCase = (str) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );

const camelToSnakeCase = (str) => str.replace(/([A-Z])/g, "_$1").toLowerCase();

export default api;
