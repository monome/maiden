import { Map } from 'immutable';
import api from '../api';
import { projectInstallURLSuccess, projectInstallURLRequest, projectInstallURLFailure } from './project-actions';

export const REPL_ENDPOINTS_REQUEST = 'REPL_ENDPOINTS_REQUEST';
export const REPL_ENDPOINTS_SUCCESS = 'REPL_ENDPOINTS_SUCCESS';
export const REPL_ENDPOINTS_FAILURE = 'REPL_ENDPOINTS_FAILURE';

export const REPL_CONNECT_DIAL = 'REPL_CONNECT_DIAL';
export const REPL_CONNECT_SUCCESS = 'REPL_CONNECT_SUCCESS';
export const REPL_CONNECT_FAILURE = 'REPL_CONNECT_FAILURE';
export const REPL_CONNECT_CLOSE = 'REPL_CONNECT_CLOSE';

export const REPL_RECEIVE = 'REPL_RECEIVE';
export const REPL_SEND = 'REPL_SEND';
export const REPL_ECHO = 'REPL_ECHO';

export const REPL_SELECT = 'REPL_SELECT';
export const REPL_CLEAR = 'REPL_CLEAR';

export const REPL_UNIT_MAP_REQUEST = 'REPL_UNIT_MAP_REQUEST';
export const REPL_UNIT_MAP_SUCCESS = 'REPL_UNIT_MAP_SUCCESS';
export const REPL_UNIT_MAP_FAILURE = 'REPL_UNIT_MAP_FAILURE';

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

export const replEcho = (component, value) => ({ type: REPL_ECHO, component, value });

export const replSelect = component => ({ type: REPL_SELECT, component });

export const replClear = component => ({ type: REPL_CLEAR, component });

export const unitMappingRequest = () => ({ type: REPL_UNIT_MAP_REQUEST });

export const unitMappingSuccess = units => ({ type: REPL_UNIT_MAP_SUCCESS, units });

export const unitMappingFailure = error => ({ type: REPL_UNIT_MAP_SUCCESS, error });

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

export const replConnect = (component, endpoint, retryCount) => dispatch => {
  dispatch(replConnectDial(component, endpoint));
  const socket = new WebSocket(endpoint, ['bus.sp.nanomsg.org']);
  socket.onopen = () => {
    dispatch(replConnectSuccess(component, socket));
  };
  socket.onerror = error => {
    if (retryCount && retryCount > 0) {
      const attempt = new Promise(resolve => setTimeout(resolve, 250));
      attempt.then(() => {
        dispatch(replConnect(component, endpoint, retryCount - 1));
      });
    } else {
      dispatch(replConnectFailure(component, error));
    }
  };
  socket.onclose = () => {
    dispatch(replConnectClose(component));
  };
  socket.onmessage = event => {
    dispatch(replReceive(component, event.data));
  };
};

export const unitMapping = cb => dispatch => {
  dispatch(unitMappingRequest());
  return api.getUnitMapping(mapping => {
    dispatch(unitMappingSuccess(mapping));
    if (cb) {
      cb(mapping);
    }
  });
};

export const replInput = (component, value) => (dispatch, getState) => {
  // MAINT: this leverages redux-thunk to allow dispatching of async actions
  // from unit operations and accessing state

  // check to see if the input is a unit command, if so fire off async actions
  const input = value.trim();
  if (input.startsWith(';')) {
    const operation = input.slice(1).split(/\s+/);
    if (operation[0] === 'install') {
      console.log("doing install for:", operation);
      const projectURL = operation[1];
      dispatch(projectInstallURLRequest(projectURL));
      dispatch(replEcho(component, ';' + operation.join(" "))); // inject into command history
      dispatch(replReceive(component, "starting..."));
      api.installProjectFromURL(projectURL, successResponse => {
          dispatch(projectInstallURLSuccess(successResponse, projectURL));
          dispatch(replReceive(component, `installed "${successResponse.catalog_entry.project_name}"!`));
        },
        failResponse => {
          dispatch(projectInstallURLFailure(failResponse.error, projectURL));
          dispatch(replReceive(component, failResponse.error));
        });
    } else {
      // default to assuming this is a unit operation
      const state = getState().repl;
      const unitName = state.units.get(component);
      api.doUnitOperation(unitName, operation[0], response => {
        if (response.result === 'done') {
          const endpoint = state.endpoints.get(component);
          dispatch(replConnect(component, endpoint, 4));
          dispatch(replReceive(component, `${input} => ${response.result}`));
        } else {
          dispatch(replReceive(component, `${input} => ${response.error}`));
        }
      });
    }
  } else {
    // nothing special
    dispatch(replSend(component, value));
  }
};
