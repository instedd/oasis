import { SUCCESS, FETCH_SYMPTOMS_START, FETCH_SYMPTOMS } from './types';
import api from 'utils';

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
