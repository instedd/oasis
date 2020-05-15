import { SIGN_IN } from './types';
import axios from 'axios';

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
