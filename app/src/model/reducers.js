import { combineReducers } from 'redux';
import activity from './activity-reducers';
import edit from './edit-reducers';
import ui from './ui-reducers';
import repl from './repl-reducers';

const rootReducer = combineReducers({
  activity,
  edit,
  ui,
  repl,
});

export default rootReducer;
