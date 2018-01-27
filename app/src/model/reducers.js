import { combineReducers } from 'redux';
import scripts from './script-reducers';
import sidebar from './sidebar-reducers';

const rootReducer = combineReducers({
    scripts,
    sidebar,
})

export default rootReducer;