import { HANDLE_SICK } from './types';

export function handleSick(option) {
    return function (dispatch) {
        dispatch({
            type: HANDLE_SICK,
            sick: option
        })
    }
}
