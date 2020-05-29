import { SAVE_SICK } from './types';

export function saveSick(option) {
    return function (dispatch) {
        dispatch({
            type: SAVE_SICK,
            sick: option
        })
    }
}