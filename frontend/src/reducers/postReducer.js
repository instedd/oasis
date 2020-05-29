import { SIGN_IN, SIGN_UP, SAVE_SICK, SAVE_TESTED } from '../actions/types';
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
        case SAVE_SICK:
            return {
                ...state,
                sick: action.sick
            }
        case SAVE_TESTED:
            return {
                ...state,
                tested: action.tested
            }
        default:
            return state;
    }
}
