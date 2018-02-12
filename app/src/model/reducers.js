import { combineReducers } from 'redux';
import activity from './activity-reducers';
import scripts from './script-reducers';
import sidebar from './sidebar-reducers';
import repl from './repl-reducers';

const rootReducer = combineReducers({
    activity,
    scripts,
    sidebar,
    repl,
})

export default rootReducer;