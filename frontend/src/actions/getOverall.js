import { GET_OVERALL } from './types';

export function getOverall() {
  return function(dispatch){
    console.log("hi")
    fetch('https://covid19api.herokuapp.com/latest')
    .then((res) => {
      dispatch({
        type: GET_OVERALL,
        data:res.data
      })
      .catch((e) => {
        console.log(e);
      });
    });
  }
}
