import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import EditActivity from './edit-activity';
import { MATRON_COMPONENT } from './constants';
import { nodeForResource } from './model/listing';

import {
    scriptList,
    scriptRead,
    scriptDirRead,
    scriptSave,
    scriptChange,
    scriptSelect,
    scriptNew,
    scriptDuplicate,
    scriptDelete,
    scriptRename,
    
    toolInvoke,

    explorerActiveNode,
    explorerToggleNode,
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
const getExpandedNodes = (scriptState) => scriptState.expandedNodes;

const getScriptListing = createSelector(
    [getBuffers, getActiveBuffer, getListing, getExpandedNodes],
    (buffers, activeBuffer, listing, expandedNodes) => {
    // enrich script listing w/ modification state, etc.
    
    let enrich = (items) => {
        return items.map(l => {
            let item = {...l}
            item.active = l.url === activeBuffer;
            item.toggled = expandedNodes.has(l.url);

            let buffer = buffers.get(l.url);
            if (buffer) {
                item.loaded = true;
                item.modified = buffer.get('modified') || false;
            }

            if (item.children) {
                item.children = enrich(item.children)
            }

            return item;
        })
    };

    return enrich(listing.toJS())
});

const getActiveNode = createSelector(
    [getActiveBuffer, getListing],
    (activeBuffer, listing) => {
        return nodeForResource(listing, activeBuffer)
    }
)

const mapStateToProps = (state) => {
    let {activeBuffer, buffers} = state.scripts;
    return {
        activeBuffer, 
        activeNode: getActiveNode(state.scripts),
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
        scriptDirRead: (api, resource) => {
            dispatch(scriptDirRead(api, resource))
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

        // explorer
        explorerActiveNode: (node) => {
            dispatch(explorerActiveNode(node))
        },
        explorerToggleNode: (node, toggled) => {
            dispatch(explorerToggleNode(node, toggled))
        },
        explorerScriptNew: (sibling, value) => {
            dispatch(scriptNew(sibling, value))
        },
        explorerScriptDuplicate: (source) => {
            dispatch(scriptDuplicate(source))
        },
        explorerScriptDelete: (api, resource) => {
            dispatch(scriptDelete(api, resource))
        },
        explorerScriptRename: (api, activeNode, newName) => {
            dispatch(scriptRename(api, activeNode, newName))
        },
    }
}

const BoundEditActivity = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditActivity);

export default BoundEditActivity;