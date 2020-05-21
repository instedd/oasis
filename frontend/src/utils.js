// import { refreshToken } from './auth';
// import { refreshToken as refreshTokenAction } from 'actions/auth';
// import store from 'store/configureStore'

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

    if (response.status >= 200 && response.status < 300) return await response.json();
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response.statusText;
    const body = await response.json();
    if (body.errorCode) error.code = body.errorCode;
    throw error;
}

export default api;