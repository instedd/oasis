import { SAVE_SICK, SET_STORY } from './types';

export function saveSick(option) {
    return function (dispatch) {
        dispatch({
            type: SAVE_SICK,
            sick: option
        })
    }
}

export function setStory(story) {
    return function (dispatch) {
        dispatch({
            type: SET_STORY,
            payload: story
        })
    }
}