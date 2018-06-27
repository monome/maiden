import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import EditActivity from './edit-activity';
import { MATRON_COMPONENT } from './constants';
import { nodeForResource } from './model/listing';
import api from './api';

import {
  rootList,
  bufferRead,
  directoryRead,
  bufferSave,
  bufferChange,
  bufferSelect,
  scriptNew,
  scriptDuplicate,
  resourceDelete,
  resourceRename,
  toolInvoke,
  explorerActiveNode,
  explorerToggleNode,
  directoryCreate,
} from './model/edit-actions';

import {
  sidebarToggle,
  sidebarSize,
  replToggle,
  replSize,
  toggleCategory,
} from './model/ui-actions';

import { replSend } from './model/repl-actions';

import { editorConfig } from './model/config-actions';

const getBuffers = editState => editState.buffers;
const getActiveBuffer = editState => editState.activeBuffer;
const getActiveNodeResource = editState => editState.activeNode;
const getRootNodes = editState => editState.rootNodes;
const getExpandedNodes = editState => editState.expandedNodes;

const getExplorerData = createSelector(
  [getBuffers, getActiveBuffer, getActiveNodeResource, getRootNodes, getExpandedNodes],
  (buffers, activeBuffer, activeNode, rootNodes, expandedNodes) => {
    // enrich script listing w/ modification state, etc.

    const enrich = items =>
      items.map(l => {
        const item = { ...l };
        item.activeBuffer = l.url === activeBuffer;
        item.activeNode = l.url === activeNode;
        item.toggled = expandedNodes.has(l.url);

        const buffer = buffers.get(l.url);
        if (buffer) {
          item.loaded = true;
          item.modified = buffer.get('modified') || false;
          item.virtual = buffer.get('virtual') || false;
        }

        if (item.children) {
          item.children = enrich(item.children);
        }

        return item;
      });

    return enrich(rootNodes.toJS());
  },
);

const getActiveNode = createSelector(
  [getActiveNodeResource, getRootNodes],
  (activeNode, rootNodes) => nodeForResource(rootNodes, activeNode),
);

const mapStateToProps = state => {
  const { activeBuffer, buffers } = state.edit;
  return {
    activeBuffer,
    activeNode: getActiveNode(state.edit),
    buffers,
    ui: state.ui,
    explorerData: getExplorerData(state.edit),
    collapsedCategories: state.ui.collapsedCategories,
    editorOptions: state.config.editor,
  };
};

const mapDispatchToProps = dispatch => ({
  // scripts
  scriptList: () => {
    dispatch(rootList('scripts'));
  },
  dataList: () => {
    dispatch(rootList('data'));
  },
  audioList: () => {
    dispatch(rootList('audio'));
  },
  bufferRead: resource => {
    dispatch(bufferRead(resource));
  },
  directoryRead: resource => {
    dispatch(directoryRead(resource));
  },
  bufferChange: (resource, value) => {
    dispatch(bufferChange(resource, value));
  },
  bufferSelect: resource => {
    dispatch(bufferSelect(resource));
  },
  bufferSave: (resource, code, completionCB = () => {}) => {
    dispatch(bufferSave(resource, code, completionCB));
  },
  scriptRun: resource => {
    const file = api.fileFromResource(resource);
    if (file) {
      const cmd = `norns.script.load("${file}")`;
      dispatch(replSend(MATRON_COMPONENT, cmd));
    } else {
      console.log('resource:', resource, 'cannot be run as a script');
    }
  },

  // ui
  sidebarToggle: () => {
    dispatch(sidebarToggle());
  },
  sidebarSize: width => {
    dispatch(sidebarSize(width));
  },
  replToggle: () => {
    dispatch(replToggle());
  },
  replSize: height => {
    dispatch(replSize(height));
  },

  // tools
  toolInvoke: name => {
    dispatch(toolInvoke(name));
  },

  // explorer
  explorerActiveNode: node => {
    dispatch(explorerActiveNode(node));
  },
  explorerToggleNode: (node, toggled) => {
    dispatch(explorerToggleNode(node, toggled));
  },
  explorerScriptNew: (sibling, value, name, category) => {
    dispatch(scriptNew(sibling, value, name, category));
  },
  explorerScriptDuplicate: source => {
    dispatch(scriptDuplicate(source));
  },
  explorerResourceDelete: resource => {
    dispatch(resourceDelete(resource));
  },
  explorerResourceRename: (activeNode, newName, virtual) => {
    dispatch(resourceRename(activeNode, newName, virtual));
  },
  explorerDirectoryCreate: (resource, name, category) => {
    dispatch(directoryCreate(resource, name, category));
  },
  explorerToggleCategory: name => {
    dispatch(toggleCategory(name));
  },

  // config
  editorConfig: resource => {
    dispatch(editorConfig(resource));
  },
});

const BoundEditActivity = connect(mapStateToProps, mapDispatchToProps)(EditActivity);

export default BoundEditActivity;
