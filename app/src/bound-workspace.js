import { connect } from 'react-redux';
import Workspace from './workspace';

import { activitySelect } from './model/activity-actions';

import { toggleComponent } from './model/ui-actions';

import { replEndpoints, replConnect } from './model/repl-actions';

import { rootList } from './model/edit-actions';
import { DUST_SCRIPT_PATH, DUST_DATA_PATH, DUST_AUDIO_PATH, DUST_LUA_LIB_PATH } from './constants';

const mapStateToProps = state => {
  const selected = state.activity.selected;
  const endpoints = state.repl.endpoints;
  const configHidden = state.ui.configHidden;
  return { selected, endpoints, configHidden };
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
  scriptList: () => {
    dispatch(rootList(DUST_SCRIPT_PATH));
  },
  dataList: () => {
    dispatch(rootList(DUST_DATA_PATH));
  },
  audioList: () => {
    dispatch(rootList(DUST_AUDIO_PATH));
  },
  luaLibList: () => {
    dispatch(rootList(DUST_LUA_LIB_PATH));
  },
});

const BoundWorkspace = connect(mapStateToProps, mapDispatchToProps)(Workspace);

export default BoundWorkspace;
