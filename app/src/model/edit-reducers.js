import { Map, List, Set, fromJS } from 'immutable';

import {
    keyPathForResource,
    keyPathParent,
    nodeForResource,
    spliceDirInfo,
    spliceFileInfo,
    generateNodeName,
    virtualNode,
    collectVirtualNodes,
    spliceNodes,
    virtualRoot,
    sortDir,
    childrenOfRoot,
} from './listing';

import {
    SCRIPT_LIST_SUCCESS,
    BUFFER_READ_SUCCESS,
    DIRECTORY_READ_SUCCESS,
    BUFFER_SAVE_SUCCESS,
    BUFFER_SELECT,
    BUFFER_CHANGE,
    SCRIPT_NEW,
    RESOURCE_DELETE_SUCCESS,
    SCRIPT_DUPLICATE,
    DIRECTORY_CREATE_SUCCESS,
    RESOURCE_RENAME_SUCCESS,

    TOOL_INVOKE,

    EXPLORER_ACTIVE_NODE,
    EXPLORER_TOGGLE_NODE,

    scriptNew,
} from './edit-actions';

import { siblingScriptResourceForName } from '../api';

/*

edit: {
    activeNode: <url>,
    expandedNodes: Set(),
    rootNodes: [
        { name: ..., url: ... },
        { name: ..., url:... , children: [
            <more rootNodes>
        ]}
    ]
    activeBuffer: <url>,
    buffers: Map({
        <url>: {
            url: <url>,p
            modified: <bool>,
            value: <string>,
        }
    })
}

*/

const initialScriptsState = {
    activeBuffer: undefined,
    rootNodes: virtualRoot(new List(), "SCRIPTS"),
    buffers: new Map(),
    activeNode: undefined,
    expandedNodes: new Set(),
};

const edit = (state = initialScriptsState, action) => {
    switch (action.type) {
    case SCRIPT_LIST_SUCCESS:
        return handleScriptList(action, state);

    case BUFFER_READ_SUCCESS:
        return {
            ...state,
            buffers: state.buffers.set(action.resource, new Map({
                value: action.value,
                modified: false,
            })),
        };

    case DIRECTORY_READ_SUCCESS:
        // console.log("splice", state.rootNodes, action.resource, action.value)
        return {
            ...state,
            rootNodes: spliceDirInfo(state.rootNodes, action.resource, fromJS(action.value.entries))
        };

    case BUFFER_SAVE_SUCCESS:
        let savedBuffer = state.buffers.get(action.resource).set("modified", false)
        if (savedBuffer.has("virtual")) {
            savedBuffer = savedBuffer.delete("virtual")
        }
        return {
            ...state,
            buffers: state.buffers.set(action.resource, savedBuffer)
        };

    case BUFFER_SELECT:
        return { ...state, activeBuffer: action.resource };

    case BUFFER_CHANGE:
        return handleBufferChange(action, state);

    case SCRIPT_NEW:
        return handleScriptNew(action, state);
    
    case SCRIPT_DUPLICATE:
        return handleScriptDuplicate(action, state);

    case RESOURCE_DELETE_SUCCESS:
        return handleResourceDeleteSuccess(action, state);

    case RESOURCE_RENAME_SUCCESS:
        return handleResourceRenameSuccess(action, state);

    case DIRECTORY_CREATE_SUCCESS:
        return handleScriptNewFolderSuccess(action, state);

    case TOOL_INVOKE:
        console.log("tool invoke => ", action.name);
        return state;

    case EXPLORER_ACTIVE_NODE:
        return { ...state, activeNode: action.node.url }

    case EXPLORER_TOGGLE_NODE:
        if (action.toggled) {
            return { ...state, expandedNodes: state.expandedNodes.add(action.node.url) }
        }
        return { ...state, expandedNodes: state.expandedNodes.delete(action.node.url) }

    default:
        return state;
    }
};


const handleBufferChange = (action, state) => {
    if (action.resource === undefined) {
        console.log("implicitly creating new script");
        return handleScriptNew(scriptNew(undefined, action.value), state);
    }

    let buffer = state.buffers.get(action.resource);
    if (buffer === undefined) {
        console.log('ignoring script change for missing buffer (possibly deleted):', action.resource)
        return state
    }

    let modified = buffer.get('modified') || buffer.get('value') !== action.value; // FIXME: inefficient?
    let changes = new Map({
        value: action.value,
        modified: modified,
    });
    return { ...state, buffers: state.buffers.set(action.resource, buffer.merge(changes)) };
}

const handleScriptList = (action, state) => {
    // retain existing virtual nodes (!!! except root node)
    let virtuals = collectVirtualNodes(state.rootNodes).filter(n => n.get("name") === state.rootNodes.get("name"))
    let rootNodes = spliceNodes(virtualRoot(fromJS(action.value.entries), "SCRIPTS"), virtuals)
    return { ...state, rootNodes };
}

// IDEA: might be cool if this copied 'template.lua' as a starting point
const handleScriptNew = (action, state) => {
    // assume script will be placed at the top of the hierarchy
    let siblings = childrenOfRoot(state.rootNodes);

    let childPath = keyPathForResource(state.rootNodes, action.siblingResource)
    if (childPath) {
        // a sibling exists, use that level of hierarchy for name computation
        let siblingPath = childPath.pop()
        siblings = state.rootNodes.getIn(siblingPath)
    }

    let newName = generateNodeName(siblings, action.name || "untitled.lua")
    let newResource = siblingScriptResourceForName(newName, action.siblingResource)
    let newBuffer = new Map({
        modified: true,
        value: action.value || "",
    });

    let newNode = virtualNode(newName, newResource)
    let newRootNodes = spliceFileInfo(state.rootNodes, newNode, action.siblingResource)

    return {
        ...state,
        rootNodes: newRootNodes,
        activeBuffer: newResource,
        buffers: state.buffers.set(newResource, newBuffer),
    };
}

const handleResourceDeleteSuccess = (action, state) => {
    console.log('in handleResourceDelete()', action)
    let childPath = keyPathForResource(state.rootNodes, action.resource)
    let newRootNodes = state.rootNodes.removeIn(childPath)
    let newActiveBuffer = state.activeBuffer === action.resource ? undefined : state.activeBuffer;

    return {
        ...state,
        rootNodes: newRootNodes,
        activeBuffer: newActiveBuffer,
        buffers: state.buffers.delete(action.resource)
    }
}

const handleScriptDuplicate = (action, state) => {
    if (!action.resource) {
        // can't duplicate without a resource
        return state
    }

    let sourceNode = nodeForResource(state.rootNodes, action.resource)
    if (!sourceNode) {
        console.log('cannot find existing resource to duplicate')
        return state
    }

    let sourceBuffer = state.buffers.get(action.resource)
    let newAction = scriptNew(action.resource, sourceBuffer.get('value'), sourceNode.get('name'))

    return handleScriptNew(newAction, state)
}

const handleScriptNewFolderSuccess = (action, state) => {
    return state;
}

const handleResourceRenameSuccess = (action, state) => {
    console.log("rename success: ", action)

    let newResource = action.newResource
    if (!newResource) {
        // assume this is virtual; fabricate new url
        newResource = siblingScriptResourceForName(action.newName, action.resource)
        console.log(action.resource, " => ", newResource)
    }

    let oldNode = nodeForResource(state.rootNodes, action.resource)
    let newNode = oldNode.set("url", newResource).set("name", action.newName)

    let keyPath = keyPathForResource(state.rootNodes, action.resource);
    let rootNodes = state.rootNodes.setIn(keyPath, newNode);

    // sort parent dir of node
    let dirPath = keyPathParent(keyPath)

    rootNodes = sortDir(rootNodes, dirPath)

    // update active buffer if pointing at the renamed resource
    let activeBuffer = state.activeBuffer === action.resource ? newResource : state.activeBuffer;

    // buffers are keyed by resource, modify that too
    let buffers = state.buffers.set(newResource, state.buffers.get(action.resource)).delete(action.resource);

    return {
        ...state,
        activeBuffer,
        rootNodes,
        buffers,
    };
}

export default edit;