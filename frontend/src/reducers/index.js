import { combineReducers } from "redux";
import auth from "./auth";
import story from "./story";
import symptoms from "./symptoms";

export default combineReducers({
  auth,
  symptoms,
  story,
});
