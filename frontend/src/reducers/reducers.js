import { combineReducers } from 'redux';
import auth from './auth';
import getReducer from './getReducer';
import postReducer from './postReducer';
import symptoms from './symptoms';
import story from './story';

export default combineReducers({
  get:getReducer,
  post:postReducer,
  auth,
  symptoms,
  story,
});
