import axios from "axios";
import { GET_OVERALL } from "./types";
// axios.defaults.withCredentials = true

export function getOverall() {
  return function (dispatch) {
    axios
      .get("https://covid19api.herokuapp.com/latest")
      .then((res) => {
        dispatch({
          type: GET_OVERALL,
          data: res.data,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };
}
