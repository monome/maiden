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
    sortDir
} from './listing';

import {
    SCRIPT_LIST_SUCCESS,
    SCRIPT_READ_SUCCESS,
    SCRIPT_DIR_SUCCESS,
    SCRIPT_SAVE_SUCCESS,
    SCRIPT_SELECT,
    SCRIPT_CHANGE,
    SCRIPT_NEW,
    SCRIPT_DELETE_SUCCESS,
    SCRIPT_DUPLICATE,
    SCRIPT_NEW_FOLDER_SUCCESS,
    SCRIPT_RENAME_SUCCESS,

    TOOL_INVOKE,

    EXPLORER_ACTIVE_NODE,
    EXPLORER_TOGGLE_NODE,

    scriptNew,
} from './script-actions';

import { siblingScriptResourceForName } from '../api';

/*

scripts: {
    activeNode: <url>,
    expandedNodes: Set(),
    rootNode: [
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
    rootNode: virtualRoot(new List()),
    buffers: new Map(),
    activeNode: undefined,
    expandedNodes: new Set(),
};

const scripts = (state = initialScriptsState, action) => {
    switch (action.type) {
    case SCRIPT_LIST_SUCCESS:
        return handleScriptList(action, state);
        // return { ...state, rootNode: fromJS(action.value.entries) };

    case SCRIPT_READ_SUCCESS:
        return {
            ...state,
            buffers: state.buffers.set(action.resource, new Map({
                value: action.value,
                modified: false,
            })),
        };

    case SCRIPT_DIR_SUCCESS:
        // console.log("splice", state.rootNode, action.resource, action.value)
        return {
            ...state,
            rootNode: spliceDirInfo(state.rootNode, action.resource, fromJS(action.value.entries))
        };

    case SCRIPT_SAVE_SUCCESS:
        let savedBuffer = state.buffers.get(action.resource).set("modified", false)
        if (savedBuffer.has("virtual")) {
            savedBuffer = savedBuffer.delete("virtual")
        }
        return {
            ...state,
            buffers: state.buffers.set(action.resource, savedBuffer)
        };

    case SCRIPT_SELECT:
        return { ...state, activeBuffer: action.resource };

    case SCRIPT_CHANGE:
        return handleScriptChange(action, state);

    case SCRIPT_NEW:
        return handleScriptNew(action, state);

    case SCRIPT_DELETE_SUCCESS:
        return handleScriptDeleteSuccess(action, state);

    case SCRIPT_DUPLICATE:
        return handleScriptDuplicate(action, state);

    case SCRIPT_NEW_FOLDER_SUCCESS:
        return handleScriptNewFolderSuccess(action, state);

    case SCRIPT_RENAME_SUCCESS:
        return handleScriptRenameSuccess(action, state);

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


const handleScriptChange = (action, state) => {
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
    let virtuals = collectVirtualNodes(state.rootNode).filter(n => n.get("name") === state.rootNode.get("name"))
    let rootNode = spliceNodes(virtualRoot(fromJS(action.value.entries)), virtuals)
    return { ...state, rootNode };
}

// IDEA: might be cool if this copied 'template.lua' as a starting point
const handleScriptNew = (action, state) => {
    // assume script will be placed at the top of the hierarchy
    let siblings = state.rootNode;

    let childPath = keyPathForResource(state.rootNode, action.siblingResource)
    if (childPath) {
        // a sibling exists, use that level of hierarchy for name computation
        let siblingPath = childPath.pop()
        siblings = state.rootNode.getIn(siblingPath)
    }

    let newName = generateNodeName(siblings, action.name || "untitled.lua")
    let newResource = siblingScriptResourceForName(newName, action.siblingResource)
    let newBuffer = new Map({
        modified: true,
        value: action.value || "",
    });

    let newNode = virtualNode(newName, newResource)
    let newRootNode = spliceFileInfo(state.rootNode, newNode, action.siblingResource)

    return {
        ...state,
        rootNode: newRootNode,
        activeBuffer: newResource,
        buffers: state.buffers.set(newResource, newBuffer),
    };
}

const handleScriptDeleteSuccess = (action, state) => {
    console.log('in handleScriptDelete()', action)
    let childPath = keyPathForResource(state.rootNode, action.resource)
    let newRootNode = state.rootNode.removeIn(childPath)
    let newActiveBuffer = state.activeBuffer === action.resource ? undefined : state.activeBuffer;

    return {
        ...state,
        rootNode: newRootNode,
        activeBuffer: newActiveBuffer,
        buffers: state.buffers.delete(action.resource)
    }
}

const handleScriptDuplicate = (action, state) => {
    if (!action.resource) {
        // can't duplicate without a resource
        return state
    }

    let sourceNode = nodeForResource(state.rootNode, action.resource)
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

const handleScriptRenameSuccess = (action, state) => {
    console.log("rename success: ", action)

    let newResource = action.newResource
    if (!newResource) {
        // assume this is virtual; fabricate new url
        newResource = siblingScriptResourceForName(action.newName, action.resource)
        console.log(action.resource, " => ", newResource)
    }

    let oldNode = nodeForResource(state.rootNode, action.resource)
    let newNode = oldNode.set("url", newResource).set("name", action.newName)

    let keyPath = keyPathForResource(state.rootNode, action.resource);
    let rootNode = state.rootNode.setIn(keyPath, newNode);

    // sort parent dir of node
    let dirPath = keyPathParent(keyPath)

    rootNode = sortDir(rootNode, dirPath)

    // update active buffer if pointing at the renamed resource
    let activeBuffer = state.activeBuffer === action.resource ? newResource : state.activeBuffer;

    // buffers are keyed by resource, modify that too
    let buffers = state.buffers.set(newResource, state.buffers.get(action.resource)).delete(action.resource);

    return {
        ...state,
        activeBuffer,
        rootNode,
        buffers,
    };
}

export default scripts;