import { SAVE_TESTED } from './types';

export function saveTested(option) {
    return function (dispatch) {
        dispatch({
            type: SAVE_TESTED,
            tested: option
        })
    }
}
