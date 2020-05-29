import {store} from './redux';

import { ERROR } from "actions/types";
import history from "./history";
import paths from "routes/paths";

const api = async (path, payload = {}, explicitBody = false) => {
  const { auth } = await store.getState();
  const fullPayload = {
    method: 'GET',
    ...payload,
    headers: {
      'Content-Type': 'application/json',
      ...payload.headers,
    },
    body: explicitBody
      ? payload.body
      : JSON.stringify(Object.keys(payload.body || {}).reduce(
        (acc, key) => {
          const snakeCaseKey = key.replace( /([A-Z])/g, "_$1").toLowerCase();
          acc[snakeCaseKey] = payload.body[key];
          return acc;
        },
        {}
      ))
  };
  if (auth && auth.token) fullPayload.headers['Authorization'] = `Bearer ${auth.token}`;

  let response = await fetch(`${process.env.REACT_APP_API || ''}/api/${path}`, fullPayload);
  if (response.status === 401) 
    history.push(paths.signIn);
  // if everything was correct, process data
  if (response.status >= 200 && response.status < 300) return await response.json();

  // if we had a known error, return the proper status
  const body = await response.json();
  return {
    error: {
      code: response.status,
      type: ERROR,
      detail: body.detail || 'Unknown error! Please try again',
    }
  }
}

export default api;
