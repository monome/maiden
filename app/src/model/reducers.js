import { combineReducers } from 'redux';
import activity from './activity-reducers';
import edit from './edit-reducers';
import ui from './ui-reducers';
import repl from './repl-reducers';
import config from './config-reducers';

const rootReducer = combineReducers({
  activity,
  edit,
  ui,
  repl,
  config
});

export default rootReducer;
