import { SIGN_IN, SIGN_UP, HANDLE_SICK, HANDLE_TESTED, SET_STORY } from '../actions/types';
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
        case HANDLE_SICK:
            return {
                ...state,
                sick: action.sick
            }
        case HANDLE_TESTED:
            return {
                ...state,
                tested: action.tested
            }
        case SET_STORY: 
            return {
                ...state,
                story: action.payload,
            }
        default:
            return state;
    }
}
