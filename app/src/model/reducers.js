import { combineReducers } from 'redux';
import activity from './activity-reducers';
import scripts from './script-reducers';
import ui from './ui-reducers';
import repl from './repl-reducers';

const rootReducer = combineReducers({
    activity,
    scripts,
    ui,
    repl,
})

export default rootReducer;