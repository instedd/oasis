import {SAVE_STORY_START, SAVED_STORY, SUCCESS, SIGN_IN} from './types'
import api from 'utils';
import history from '../history';

export const submitStory = (dto) => async (dispatch, getState) => {
    const { token } = getState().auth;
    dispatch({type: SAVE_STORY_START});
    const {story, nextPage} = dto;
    const response = await api(`stories/`, {
        method: 'POST',
        body: story,
    });
      
    dispatch({
        type: SAVED_STORY,
        payload: {
            status: response.error || { type: SUCCESS },
            story: (!response.error && response) || null,
        }
    });

    // if there was no token identifying a user, we need to store the story auth for future data validation
    if (!token) dispatch({
        type: SIGN_IN,
        payload: {
            status: {type: SUCCESS},
            token: response && response.token,
        }
    });
    
    if (!response.error) history.push(nextPage);
}
