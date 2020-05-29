import { combineReducers } from 'redux';
import auth from './auth';
import getReducer from './getReducer';
import postReducer from './postReducer';
import story from './story';

export default combineReducers({
  get:getReducer,
  post:postReducer,
  auth,
  story
});
