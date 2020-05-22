// import { refreshToken } from './auth';
// import { refreshToken as refreshTokenAction } from 'actions/auth';
// import store from 'store/configureStore'

import { ERROR } from "actions/types";

const api = async (path, payload = {}) => {
    // const { auth } = await store.getState();
    const fullPayload = {
        method: 'GET',
        ...payload,
        headers: {
            'Content-Type': 'application/json',
            ...payload.headers,
        },
        body: JSON.stringify(Object.keys(payload.body || {}).reduce(
            (acc, key) => {
              const snakeCaseKey = key.replace( /([A-Z])/g, "_$1").toLowerCase();
              acc[snakeCaseKey] = payload.body[key];
              return acc;
            },
            {}
          ))
    };
    // if (auth && auth.token) fullPayload.headers['Authorization'] = `Bearer ${auth.token}`;

    const request = () => fetch(`${process.env.REACT_APP_API || ''}/api/${path}`, fullPayload);

    let response = await request();
    // if (auth && response.status === 401) {
    //     const newAuth = await refreshToken(auth);
    //     store.dispatch(refreshTokenAction(auth));
    //     fullPayload.headers['Authorization'] = `Bearer ${newAuth.token}`;
    //     response = await request();
    // }

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