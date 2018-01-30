import { connect } from 'react-redux';
import EditActivity from './edit-activity';

import {
    scriptList,
    scriptRead,
    scriptSave,
    scriptChange,
    scriptSelect,
    
    toolInvoke,
} from './model/script-actions';

import {
    sidebarToggle,
    sidebarSize,
} from './model/sidebar-actions';


const getScriptListing = ({buffers, activeBuffer, listing}) => {
    // enrich script listing w/ modification state, etc.
    return listing.toJS().map(l => {
        let item = Object.assign({}, l);
        item.active = l.url === activeBuffer;

        let buffer = buffers.get(l.url);
        if (buffer) {
            item.loaded = true;
            item.modified = buffer.get('modified') || false;
        }

        return item;
    });
}

const mapStateToProps = (state) => {
    let {activeBuffer, buffers} = state.scripts;
    return {
        editor: {activeBuffer, buffers},
        sidebar: {
            ...state.sidebar,
            data: getScriptListing(state.scripts),
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // scripts
        scriptList: (api) => {
            dispatch(scriptList(api))
        },
        scriptRead: (api, resource) => {
            dispatch(scriptRead(api, resource))
        },
        scriptChange: (resource, value) => {
            dispatch(scriptChange(resource, value))
        },
        scriptSelect: (resource) => {
            dispatch(scriptSelect(resource))
        },
        scriptSave: (api, resource, code, completionCB = () => {}) => {
            dispatch(scriptSave(api, resource, code, completionCB))
        },

        // sidebar
        sidebarToggle: () => {
            dispatch(sidebarToggle())
        },
        sidebarSize: (width) => {
            dispatch(sidebarSize(width))
        },

        // tools
        toolInvoke: (name) => {
            dispatch(toolInvoke(name))
        },
    }
}

const BoundEditActivity = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditActivity);

export default BoundEditActivity;