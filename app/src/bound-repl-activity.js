import { connect } from 'react-redux';
import ReplActivity from './repl-activity';

import {
  replSend,
  replClear,
  replConnect,
  replSelect,
} from './model/repl-actions';

const isConnected = state => (component) => {
  const conn = state.repl.connections.get(component);
  if (!conn) {
    return false;
  }
  if (conn.get('socket')) {
    return true;
  }
  return false;
};

const mapStateToProps = (state) => {
  // TODO: pull out the buffer and history for the active repl to avoid re-renders if output to no-active repl is received.
  const {
    activeRepl, endpoints, buffers, history,
  } = state.repl;
  return {
    activeRepl,
    endpoints,
    buffers,
    history,
    hidden: state.ui.replHidden,
    isConnected: isConnected(state),
  };
};

const mapDispatchToProps = dispatch => ({
  replSend: (component, value) => {
    dispatch(replSend(component, value));
  },
  replClear: (component) => {
    dispatch(replClear(component));
  },
  replConnect: (component, endpoint) => {
    dispatch(replConnect(component, endpoint));
  },
  replSelect: (component) => {
    dispatch(replSelect(component));
  },
});

const BoundReplActivity = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReplActivity);

export default BoundReplActivity;
