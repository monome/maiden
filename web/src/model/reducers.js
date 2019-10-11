import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import activity from './activity-reducers';
import edit from './edit-reducers';
import ui from './ui-reducers';
import repl from './repl-reducers';
import config from './config-reducers';
import projects from './project-reducers';

const createRootReducer = (history) => combineReducers({
  activity,
  edit,
  ui,
  repl,
  config,
  projects,
  router: connectRouter(history),
});

export default createRootReducer;
