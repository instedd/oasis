import { SUCCESS, FETCH_SYMPTOMS_START, FETCH_SYMPTOMS, SUBMIT_SYMPTOMS_START, SUBMIT_SYMPTOMS } from './types';
import api from 'utils';
import history from '../history';

export const fetchSymptoms = () => async (dispatch) => {
  dispatch({type: FETCH_SYMPTOMS_START});
  const response = await api(`symptoms`);
  dispatch({
    type: FETCH_SYMPTOMS,
    payload: {
      status: response.error || { type: SUCCESS },
      all: (!response.error && response) || [],
    }
  });
}

export const submitSymptoms = (symptoms, nextPath) => async (dispatch, getState) => {
  dispatch({type: SUBMIT_SYMPTOMS_START});
  const {story} = getState().story;
  const response = await api(`stories/${story.id}/symptoms`, {
    method: 'POST',
    body: symptoms.map(id => ({
      storyId: story.id,
      symptomId: id,
    })),
  });
  dispatch({
    type: SUBMIT_SYMPTOMS,
    payload: {
      status: response.error || { type: SUCCESS },
    }
  });
  if (!response.error) history.push(nextPath);
}
