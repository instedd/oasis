import { SIGN_IN, SIGN_UP } from '../actions/types';
const initialState = {
    status: {}
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SIGN_IN:
            return {
                ...state,
                status: action.status === "success" ? true : false,
                email: action.email,
            };
        case SIGN_UP:
            return {
                ...state,
                email: action.email,
                username: action.username
            };
        default:
            return state;
    }
}
