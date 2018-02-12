import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import EditActivity from './edit-activity';
import { MATRON_COMPONENT } from './constants';

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

import {
    replSend,
} from './model/repl-actions';

const getBuffers = (scriptState) => scriptState.buffers;
const getActiveBuffer = (scriptState) => scriptState.activeBuffer;
const getListing = (scriptState) => scriptState.listing;

const getScriptListing = createSelector(
    [getBuffers, getActiveBuffer, getListing],
    (buffers, activeBuffer, listing) => {
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
});

const mapStateToProps = (state) => {
    let {activeBuffer, buffers} = state.scripts;
    return {
        activeBuffer, 
        buffers,
        sidebar: state.sidebar,
        scriptListing: getScriptListing(state.scripts),
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
        scriptRun: (api, resource) => {
            let file = api.fileFromResource(resource)
            let cmd = `sys.run("${file}")`
            dispatch(replSend(MATRON_COMPONENT, cmd))
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