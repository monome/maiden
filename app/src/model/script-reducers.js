import { Map, List, fromJS } from 'immutable';
import {
    SCRIPT_LIST_SUCCESS,
    SCRIPT_READ_SUCCESS,
    SCRIPT_SAVE_SUCCESS,
    SCRIPT_SELECT,
    SCRIPT_CHANGE,
    
    TOOL_INVOKE,
} from './script-actions';

/*

scripts: {
    listing: [
        { name: ..., url: ... }
    ]
    activeBuffer: <url>,
    buffers: Map({
        <url>: {
            name: <string>
            url: <url>,
            modified: <bool>,
            value: <string>,
            selection: ?,
            scrollPosition: ?,
            isFetching: <bool>
        }
    })
}

*/

const initialScriptsState = {
    activeBuffer: undefined,
    listing: new List(),
    buffers: new Map(),
};

const scripts = (state = initialScriptsState, action) => {
    switch (action.type) {
    case SCRIPT_LIST_SUCCESS:
        return { ...state, listing: fromJS(action.value) };

    case SCRIPT_READ_SUCCESS:
        return {
            ...state,
            buffers: state.buffers.set(action.resource, new Map({
                value: action.value,
                modified: false,
            })),
        };

    case SCRIPT_SAVE_SUCCESS:
        let savedBuffer = state.buffers.get(action.resource).set("modified", false)
        return {
            ...state,
            buffers: state.buffers.set(action.resource, savedBuffer)
        };

    case SCRIPT_SELECT:
        return { ...state, activeBuffer: action.resource };

    case SCRIPT_CHANGE:
        console.log(action)
        console.log(state)
        let buffer = state.buffers.get(action.resource);
        console.log(buffer)
        let modified = buffer.get('modified') || buffer.get('value') !== action.value; // FIXME: inefficient?
        let changes = new Map({
            value: action.value,
            modified: modified,
        });
        return { ...state, buffers: state.buffers.set(action.resource, buffer.merge(changes)) };

    case TOOL_INVOKE:
        console.log("tool invoke => ", action.name);
        return state;

    default:
        return state
    }
};

export default scripts;