import { combineReducers } from 'redux';
import activity from './activity-reducers';
import edit from './edit-reducers';
import ui from './ui-reducers';
import repl from './repl-reducers';
import config from './config-reducers';
import projects from './project-reducers';
import router from './router';

const rootReducer = combineReducers({
  activity,
  edit,
  ui,
  repl,
  config,
  projects,
  router,
});

export default rootReducer;
