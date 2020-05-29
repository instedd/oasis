import { combineReducers } from 'redux';
import getReducer from './getReducer';
import postReducer from './postReducer';
import auth from './auth';
import symptoms from './symptoms';

export default combineReducers({
  get:getReducer,
  post:postReducer,
  auth,
  symptoms,
});
