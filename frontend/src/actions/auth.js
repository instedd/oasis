import { SIGN_UP, SIGN_IN, SUCCESS, SIGN_UP_START } from './types';
import axios from 'axios';
import api from 'utils';
import history from '../history';
import paths from 'routes/paths';

export const signUp = (userDTO) => async (dispatch) => {
  dispatch({type: SIGN_UP_START})
  const response = await api(`users`, {
    method: 'POST',
    body: userDTO,
  });
  dispatch({
    type: SIGN_UP,
    payload: {
      status: response.error || { type: SUCCESS },
      user: (!response.error && {email: response.email}) || null,
    }
  });
}

export function signIn(email,password) {
  return function(dispatch){
    axios.post(`http://13.57.220.143/login?email=${email}&password=${password}`)
    .then((res) => {
      dispatch({
        type: SIGN_IN,
        email:email,
        status:res.data
      })
    }
    ).catch((e) => {console.log(e)})
  }
}
