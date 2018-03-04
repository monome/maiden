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
const getRootNode = (scriptState) => scriptState.rootNode;
const getExpandedNodes = (scriptState) => scriptState.expandedNodes;

const getScriptListing = createSelector(
    [getBuffers, getActiveBuffer, getRootNode, getExpandedNodes],
    (buffers, activeBuffer, rootNode, expandedNodes) => {
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

    // MAINT: this assumes the "scripts" root is the first node in the list
    // console.log("rootNode= ", rootNode.toJS())
    let scriptRoot = rootNode.getIn([0, "children"])
    if (scriptRoot) {
        return enrich(scriptRoot.toJS());
    }
    return [];
});

const getActiveNode = createSelector(
    [getActiveBuffer, getRootNode],
    (activeBuffer, rootNode) => {
        return nodeForResource(rootNode, activeBuffer)
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
        explorerScriptRename: (api, activeNode, newName, virtual) => {
            dispatch(scriptRename(api, activeNode, newName, virtual))
        },
    }
}

const BoundEditActivity = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditActivity);

export default BoundEditActivity;