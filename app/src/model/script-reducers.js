import { Map, List, Set, fromJS } from 'immutable';

import {
    keyPathForResource,
    nodeForResource,
    spliceDirInfo, 
    spliceFileInfo, 
    generateNodeName,
    virtualNode,
    collectVirtualNodes,
    spliceNodes,
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

    TOOL_INVOKE,

    EXPLORER_ACTIVE_NODE,
    EXPLORER_TOGGLE_NODE,

    scriptNew,
} from './script-actions';

import { siblingScriptResourceForName } from '../api';
import { UNTITLED_SCRIPT } from '../constants';

/*

scripts: {
    activeNode: <url>,
    expandedNodes: Set(),
    listing: [
        { name: ..., url: ... },
        { name: ..., url:... , children: [
            <more listings>
        ]}
    ]
    activeBuffer: <url>,
    buffers: Map({
        <url>: {
            url: <url>,
            modified: <bool>,
            value: <string>,
        }
    })
}

*/

const initialScriptsState = {
    activeBuffer: undefined,
    listing: new List(),
    buffers: new Map(),
    activeNode: undefined,
    expandedNodes: new Set(),
};

const scripts = (state = initialScriptsState, action) => {
    switch (action.type) {
    case SCRIPT_LIST_SUCCESS:
        return handleScriptList(action, state);
        // return { ...state, listing: fromJS(action.value.entries) };

    case SCRIPT_READ_SUCCESS:
        return {
            ...state,
            buffers: state.buffers.set(action.resource, new Map({
                value: action.value,
                modified: false,
            })),
        };

    case SCRIPT_DIR_SUCCESS:
        // console.log("splice", state.listing, action.resource, action.value)
        return {
            ...state,
            listing: spliceDirInfo(state.listing, action.resource, fromJS(action.value.entries))
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
        return handleScriptChange(action, state);

    case SCRIPT_NEW:
        return handleScriptNew(action, state);

    case SCRIPT_DELETE_SUCCESS:
        return handleScriptDeleteSuccess(action, state);

    case SCRIPT_DUPLICATE:
        return handleScriptDuplicate(action, state);

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
    if (action.resource === UNTITLED_SCRIPT || action.resource === undefined) {
        // FIXME: need to implement script new some how
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
    // retain existing virtual nodes
    let virtuals = collectVirtualNodes(state.listing);
    let listing = spliceNodes(fromJS(action.value.entries), virtuals)
    return { ...state, listing };
}

// IDEA: might be cool if this copied 'template.lua' as a starting point 
const handleScriptNew = (action, state) => {
    // assume script will be placed at the top of the hierarchy
    let siblings = state.listing;

    let childPath = keyPathForResource(state.listing, action.siblingResource)
    if (childPath) {
        // a sibling exists, use that level of hierarchy for name computation
        let siblingPath = childPath.pop()
        siblings = state.listing.getIn(siblingPath)
    }

    let newName = generateNodeName(siblings, action.name || "untitled.lua")
    let newResource = siblingScriptResourceForName(newName, action.siblingResource)
    let newBuffer = new Map({
        modified: true,
        value: action.value || "",
    });

    let newNode = virtualNode(newName, newResource)
    let newListing = spliceFileInfo(state.listing, newNode, action.siblingResource)

    return {
        ...state,
        listing: newListing,
        activeBuffer: newResource,
        buffers: state.buffers.set(newResource, newBuffer),
    };
}

const handleScriptDeleteSuccess = (action, state) => {
    console.log('in handleScriptDelete()', action)
    let childPath = keyPathForResource(state.listing, action.resource)
    let newListing = state.listing.removeIn(childPath)
    let newActiveBuffer = state.activeBuffer === action.resource ? undefined : state.activeBuffer;

    return {
        ...state,
        listing: newListing,
        activeBuffer: newActiveBuffer,
        buffers: state.buffers.delete(action.resource)
    }
}

const handleScriptDuplicate = (action, state) => {
    if (!action.resource) {
        // can't duplicate without a resource
        return state
    }
    
    let sourceNode = nodeForResource(state.listing, action.resource)
    if (!sourceNode) {
        console.log('cannot find existing resource to duplicate')
        return state
    }

    let sourceBuffer = state.buffers.get(action.resource)
    let newAction = scriptNew(action.resource, sourceBuffer.get('value'), sourceNode.get('name'))
    
    return handleScriptNew(newAction, state)
}

export default scripts;