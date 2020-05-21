import { SIGN_UP, SIGN_IN } from './types';
import axios from 'axios';
import api from 'utils';

export const signUp = (userDTO) => async (dispatch) => {
  const user = await api(`users`, {
    method: 'POST',
    body: userDTO,
  });
  console.log(user);
  dispatch({
    type: SIGN_UP,
    username: userDTO.username,
    email: userDTO.email,
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
