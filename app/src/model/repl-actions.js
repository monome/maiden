import { Map } from 'immutable';
import api from '../api';

export const REPL_ENDPOINTS_REQUEST = 'REPL_ENDPOINTS_REQUEST';
export const REPL_ENDPOINTS_SUCCESS = 'REPL_ENDPOINTS_SUCCESS';
export const REPL_ENDPOINTS_FAILURE = 'REPL_ENDPOINTS_FAILURE';

export const REPL_CONNECT_DIAL = 'REPL_CONNECT_DIAL';
export const REPL_CONNECT_SUCCESS = 'REPL_CONNECT_SUCCESS';
export const REPL_CONNECT_FAILURE = 'REPL_CONNECT_FAILURE';
export const REPL_CONNECT_CLOSE = 'REPL_CONNECT_CLOSE';

export const REPL_RECEIVE = 'REPL_RECEIVE';
export const REPL_SEND = 'REPL_SEND';

export const REPL_SELECT = 'REPL_SELECT';
export const REPL_CLEAR = 'REPL_CLEAR';

//
// sync action creators
//

export const replEndpointsRequest = () => ({ type: REPL_ENDPOINTS_REQUEST });

export const replEndpointsSuccess = endpoints => ({ type: REPL_ENDPOINTS_SUCCESS, endpoints });

export const replEndpointsFailure = error => ({ type: REPL_ENDPOINTS_FAILURE, error });

export const replConnectDial = (component, endpoint) => ({
  type: REPL_CONNECT_DIAL,
  component,
  endpoint,
});

export const replConnectSuccess = (component, socket) => ({
  type: REPL_CONNECT_SUCCESS,
  component,
  socket,
});

export const replConnectFailure = (component, error) =>
  // console.log(error);
  ({ type: REPL_CONNECT_FAILURE, component, error });

export const replConnectClose = component => ({ type: REPL_CONNECT_CLOSE, component });

export const replReceive = (component, data) => ({ type: REPL_RECEIVE, component, data });

export const replSend = (component, value) => ({ type: REPL_SEND, component, value });

export const replSelect = component => ({ type: REPL_SELECT, component });

export const replClear = component => ({ type: REPL_CLEAR, component });

//
// async actions
//

export const replEndpoints = cb => dispatch => {
  dispatch(replEndpointsRequest());
  return api.getReplEndpoints(endpoints => {
    // FIXME: handle errors
    dispatch(replEndpointsSuccess(endpoints));
    if (cb) {
      // MAINT: lame, keep immutable map type consistent between this callback and the actual state
      cb(new Map(endpoints));
    }
  });
};

export const replConnect = (component, endpoint) => dispatch => {
  dispatch(replConnectDial(component, endpoint));
  const socket = new WebSocket(endpoint, ['bus.sp.nanomsg.org']);
  socket.onopen = () => {
    dispatch(replConnectSuccess(component, socket));
  };
  socket.onerror = error => {
    dispatch(replConnectFailure(component, error));
  };
  socket.onclose = () => {
    dispatch(replConnectClose(component));
  };
  socket.onmessage = event => {
    dispatch(replReceive(component, event.data));
  };
};
