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
  sortDir,
  rootCategoryIndex,
  childrenOfRoot,
  directoryNode,
} from './listing';

import {
  ROOT_LIST_SUCCESS,
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

import { siblingResourceForName } from '../api';

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

const initialEditState = {
  activeBuffer: undefined,
  rootNodes: new List(),
  buffers: new Map(),
  activeNode: undefined,
  expandedNodes: new Set(),
};

const edit = (state = initialEditState, action) => {
  switch (action.type) {
    case ROOT_LIST_SUCCESS:
      return handleRootList(action, state);

    case BUFFER_READ_SUCCESS:
      return {
        ...state,
        buffers: state.buffers.set(action.resource, new Map({
          value: action.value,
          modified: false,
          contentType: action.contentType,
        })),
      };

    case DIRECTORY_READ_SUCCESS:
      // console.log("splice", state.rootNodes, action.resource, action.value)
      return {
        ...state,
        rootNodes: spliceDirInfo(state.rootNodes, action.resource, fromJS(action.value.entries)),
      };

    case BUFFER_SAVE_SUCCESS:
      let savedBuffer = state.buffers.get(action.resource).set('modified', false);
      if (savedBuffer.has('virtual')) {
        savedBuffer = savedBuffer.delete('virtual');
      }
      return {
        ...state,
        buffers: state.buffers.set(action.resource, savedBuffer),
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
      return handleDirectoryCreateSuccess(action, state);

    case TOOL_INVOKE:
      console.log('tool invoke => ', action.name);
      return state;

    case EXPLORER_ACTIVE_NODE:
      return { ...state, activeNode: action.node.url };

    case EXPLORER_TOGGLE_NODE:
      if (action.toggled) {
        return { ...state, expandedNodes: state.expandedNodes.add(action.node.url) };
      }
      return { ...state, expandedNodes: state.expandedNodes.delete(action.node.url) };

    default:
      return state;
  }
};


const handleBufferChange = (action, state) => {
  if (action.resource === undefined) {
    console.log('implicitly creating new script');
    return handleScriptNew(scriptNew(undefined, action.value), state);
  }

  const buffer = state.buffers.get(action.resource);
  if (buffer === undefined) {
    console.log('ignoring change for missing buffer (possibly deleted):', action.resource);
    return state;
  }

  // FIXME: super janky hack to prevent marking binary buffers dirty, this needs to be removed when proper alt ui is in place for the editor when binary files are selected
  if (!buffer.get('contentType').includes('text')) {
    console.log('ignoring buffer change for binary buffer');
    return state;
  }

  const modified = buffer.get('modified') || buffer.get('value') !== action.value; // FIXME: inefficient?
  const changes = new Map({
    value: action.value,
    modified,
    contentType: buffer.get('contentType'),
  });
  return { ...state, buffers: state.buffers.set(action.resource, buffer.merge(changes)) };
};

const handleRootList = (action, state) => {
  // FIXME: change the virtualNode resource to be the api path
  let rootNode = virtualNode(action.name, '/', fromJS(action.value.entries));

  const existingRootIndex = state.rootNodes.findIndex(n => n.get('name') === action.name);
  if (existingRootIndex > 0) {
    const virtuals = collectVirtualNodes(state.rootNodes.getIn([existingRootIndex, 'children']));
    const rootChildren = rootNode.get('children');
    rootNode = rootNode.set('children', spliceNodes(rootChildren, virtuals));
  }

  let rootNodes;
  if (existingRootIndex > 0) {
    rootNodes = state.rootNodes.set(existingRootIndex, rootNode);
  } else {
    rootNodes = state.rootNodes.push(rootNode);
  }

  return { ...state, rootNodes };
};

// IDEA: might be cool if this copied 'template.lua' as a starting point
const handleScriptNew = (action, state) => {
  const category = action.category || 'scripts';
  const categoryIndex = rootCategoryIndex(state.rootNodes, category);

  // assume script will be placed at the top of the hierarchy (by default)
  let siblings = childrenOfRoot(state.rootNodes, categoryIndex);

  const childPath = keyPathForResource(state.rootNodes, action.siblingResource);
  if (childPath) {
    // a sibling exists, use that level of hierarchy for name computation
    const siblingPath = childPath.pop();
    siblings = state.rootNodes.getIn(siblingPath);
  }

  const newName = generateNodeName(siblings, action.name || 'untitled.lua');
  const newResource = siblingResourceForName(newName, action.siblingResource, category);
  const newBuffer = new Map({
    modified: true,
    value: action.value || '',
    contentType: 'text/utf-8',
  });

  const newNode = virtualNode(newName, newResource);
  const newRootNodes = spliceFileInfo(state.rootNodes, newNode, action.siblingResource, categoryIndex);

  return {
    ...state,
    rootNodes: newRootNodes,
    activeBuffer: newResource,
    buffers: state.buffers.set(newResource, newBuffer),
  };
};

const handleResourceDeleteSuccess = (action, state) => {
  console.log('in handleResourceDelete()', action);
  const childPath = keyPathForResource(state.rootNodes, action.resource);
  const newRootNodes = state.rootNodes.removeIn(childPath);
  const newActiveBuffer = state.activeBuffer === action.resource ? undefined : state.activeBuffer;

  return {
    ...state,
    rootNodes: newRootNodes,
    activeBuffer: newActiveBuffer,
    buffers: state.buffers.delete(action.resource),
  };
};

const handleScriptDuplicate = (action, state) => {
  if (!action.resource) {
    // can't duplicate without a resource
    return state;
  }

  const sourceNode = nodeForResource(state.rootNodes, action.resource);
  if (!sourceNode) {
    console.log('cannot find existing resource to duplicate');
    return state;
  }

  const sourceBuffer = state.buffers.get(action.resource);
  const newAction = scriptNew(action.resource, sourceBuffer.get('value'), sourceNode.get('name'));

  return handleScriptNew(newAction, state);
};

const handleDirectoryCreateSuccess = (action, state) => {
  console.log('dir success:', action.category, action.resource);
  const newNode = directoryNode(action.name, action.resource);

  const categoryIndex = rootCategoryIndex(state.rootNodes, action.category);
  if (categoryIndex >= 0) {
    const rootChildren = state.rootNodes.getIn([categoryIndex, 'children']);
    // STOPPED HERE- this splice is failing
    const newChildren = spliceNodes(rootChildren, new List([newNode]));
    const newRootNodes = state.rootNodes.setIn([categoryIndex, 'children'], newChildren);
  
    return {
      ...state,
      rootNodes: newRootNodes
    };
  }

  return state;
}

const handleResourceRenameSuccess = (action, state) => {
  console.log('rename success: ', action);

  let newResource = action.newResource;
  if (!newResource) {
    // assume this is virtual; fabricate new url
    newResource = siblingResourceForName(action.newName, action.resource);
    console.log(action.resource, ' => ', newResource);
  }

  const oldNode = nodeForResource(state.rootNodes, action.resource);
  const newNode = oldNode.set('url', newResource).set('name', action.newName);

  const keyPath = keyPathForResource(state.rootNodes, action.resource);
  let rootNodes = state.rootNodes.setIn(keyPath, newNode);

  // sort parent dir of node
  const dirPath = keyPathParent(keyPath);

  rootNodes = sortDir(rootNodes, dirPath);

  // update active buffer if pointing at the renamed resource
  const activeBuffer = state.activeBuffer === action.resource ? newResource : state.activeBuffer;

  // buffers are keyed by resource, modify that too
  const buffers = state.buffers.set(newResource, state.buffers.get(action.resource)).delete(action.resource);

  return {
    ...state,
    activeBuffer,
    rootNodes,
    buffers,
  };
};

export default edit;
