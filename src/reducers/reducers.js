import { combineReducers } from 'redux';
import getReducer from './getReducer';
import postReducer from './postReducer';

export default combineReducers({
  get:getReducer,
  post:postReducer,
});