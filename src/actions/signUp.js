import { SIGN_UP } from './types';
import axios from 'axios';

export function signUp(username,email,password) {
  return function(dispatch){
    axios.post(`http://13.57.220.143/register?email=${email}&password=${password}`)
    .then((res) => {
      dispatch({
        type: SIGN_UP,
        username:username,
        email:email,
      })
    }
    ).catch((e) => {console.log(e)})
  }
}
