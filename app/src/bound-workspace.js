import { connect } from 'react-redux';
import Workspace from './workspace';

import { activitySelect } from './model/activity-actions';

import { toggleComponent } from './model/ui-actions';

import {
  replEndpoints,
  replConnect,
} from './model/repl-actions';

import { rootList } from './model/edit-actions';

const mapStateToProps = (state) => {
  const selected = state.activity.selected;
  const endpoints = state.repl.endpoints;
  return { selected, endpoints };
};

const mapDispatchToProps = dispatch => ({
  activitySelect: (name) => {
    dispatch(activitySelect(name));
  },
  toggleComponent: (name) => {
    dispatch(toggleComponent(name));
  },
  replEndpoints: (cb) => {
    dispatch(replEndpoints(cb));
  },
  replConnect: (component, endpoint) => {
    dispatch(replConnect(component, endpoint));
  },
  scriptList: () => {
    dispatch(rootList('scripts'));
  },
  dataList: () => {
    dispatch(rootList('data'));
  },
  audioList: () => {
    dispatch(rootList('audio'));
  },
});

const BoundWorkspace = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Workspace);

export default BoundWorkspace;
