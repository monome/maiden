import { connect } from 'react-redux';
import Workspace from './workspace';

import { activitySelect } from './model/activity-actions';

import { toggleComponent } from './model/ui-actions';

import { replEndpoints, replConnect } from './model/repl-actions';

import { rootList } from './model/edit-actions';
import { USER_DATA_PATH } from './constants';

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
  userDataList: () => {
    dispatch(rootList(USER_DATA_PATH));
  },
});

const BoundWorkspace = connect(mapStateToProps, mapDispatchToProps)(Workspace);

export default BoundWorkspace;
