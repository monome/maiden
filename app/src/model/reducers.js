import { combineReducers } from 'redux';
import activity from './activity-reducers';
import scripts from './script-reducers';
import sidebar from './sidebar-reducers';

const rootReducer = combineReducers({
    activity,
    scripts,
    sidebar,
})

export default rootReducer;