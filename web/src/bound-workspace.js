import { connect } from 'react-redux';
import Workspace from './workspace';

import { activitySelect } from './model/activity-actions';

import { toggleComponent } from './model/ui-actions';

import { replEndpoints, replConnect } from './model/repl-actions';

import { directoryRead, rootList } from './model/edit-actions';
import { USER_DATA_PATH } from './constants';
import { DUST_CODE_RESOURCE } from './api';

const mapStateToProps = state => {
  const selected = state.activity.selected;
  const endpoints = state.repl.endpoints;
  const configHidden = state.ui.configHidden;
  const editorTheme = state.config.editor.editorTheme;
  return { selected, endpoints, configHidden, editorTheme };
};

const mapDispatchToProps = dispatch => ({
  activitySelect: name => {
    dispatch(activitySelect(name));
  },
  toggleComponent: name => {
    dispatch(toggleComponent(name));
  },
  replEndpoints: cb => {
    dispatch(replEndpoints(cb));
  },
  replConnect: (component, endpoint) => {
    dispatch(replConnect(component, endpoint));
  },
  userDataList: () => {
    dispatch(rootList(USER_DATA_PATH, () => {
      // NB: this directory read is here to ensure that the dust/code directory is materialized ahead of any implicit "untitled.lua" buffer generation in order to ensure the implicity script lands in the code directory instead of the root directory.
      dispatch(directoryRead(DUST_CODE_RESOURCE));
    }));
  },
});

const BoundWorkspace = connect(mapStateToProps, mapDispatchToProps)(Workspace);

export default BoundWorkspace;
