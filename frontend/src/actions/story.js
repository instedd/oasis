import {SAVE_STORY_START, SAVED_STORY, SUCCESS} from './types'
import api from 'utils';
import history from '../history';

export const submitStory = (dto) => async (dispatch) => {
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
    
    if (!response.error) history.push(nextPage);
}
