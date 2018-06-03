import { Map, List } from 'immutable';
import {
  REPL_ENDPOINTS_SUCCESS,
  REPL_CONNECT_DIAL,
  REPL_CONNECT_FAILURE,
  REPL_CONNECT_SUCCESS,
  REPL_CONNECT_CLOSE,
  REPL_RECEIVE,
  REPL_SEND,
  REPL_SELECT,
  REPL_CLEAR,
} from './repl-actions';

/*
-- shape of the repl connection and scrollback buffer state

repl: {
    endpoints: Map({
        componentName: <string>
    })
    connections: Map({
        componentName: { url: ..., socket: ..., error: ... }
    }),
    activeComponent: name,
    scrollbackLimit: <int>,
    buffers: Map({
        componentName: List(<string>, ...)
    })
    history: Map({
        componentName: List(<command>, ...)
    })
}
*/

const initialReplState = {
  scrollbackLimit: 200,
  activeRepl: 'matron',
  endpoints: new Map(),
  connections: new Map(),
  buffers: new Map(),
  history: new Map(),
};

const repl = (state = initialReplState, action) => {
  const conn = state.connections.get(action.component);
  let changes, history, buffer;

  switch (action.type) {
    case REPL_ENDPOINTS_SUCCESS:
      console.log('Endpoints:', action.endpoints);
      return { ...state, endpoints: new Map(action.endpoints) };

    case REPL_CONNECT_DIAL:
      console.log('Connecting to [', action.component, '] ', action.endpoint);
      const details = new Map({
        socket: undefined,
        error: undefined,
      });
      return { ...state, connections: state.connections.set(action.component, details) };

    case REPL_CONNECT_FAILURE:
      // let conn = state.connections.get(action.component);
      changes = new Map({
        socket: undefined, // ensure this goes away
        error: action.error,
      });
      return {
        ...state,
        connections: state.connections.set(action.component, conn.merge(changes)),
      };

    case REPL_CONNECT_CLOSE:
      // let conn = state.connections.get(action.component);
      changes = new Map({
        socket: undefined,
        error: undefined,
      });
      return {
        ...state,
        connections: state.connections.set(action.component, conn.merge(changes)),
      };

    case REPL_CONNECT_SUCCESS:
      // let conn = state.connections.get(action.component);
      changes = new Map({
        socket: action.socket,
      });
      return {
        ...state,
        connections: state.connections.set(action.component, conn.merge(changes)),
        buffers: state.buffers.set(action.component, new List()),
        history: state.history.set(action.component, new List()),
      };

    case REPL_RECEIVE:
      buffer = state.buffers.get(action.component);
      action.data.split('\n').forEach(line => {
        buffer = outputAppend(buffer, state.scrollbackLimit, line.replace('\t', '  '));
      });
      return {
        ...state,
        buffers: state.buffers.set(action.component, buffer),
      };

    case REPL_SEND:
      const socket = conn.get('socket');
      if (!socket) {
        console.log("No socket; can't send", action.value, 'to', action.component);
        return state;
      }
      socket.send(`${action.value}\n`);
      // add command to history list
      history = state.history.get(action.component).unshift(action.value);
      // echo command to output buffer
      buffer = state.buffers.get(action.component);
      buffer = outputAppend(buffer, state.scrollbackLimit, action.value);
      return {
        ...state,
        history: state.history.set(action.component, history),
        buffers: state.buffers.set(action.component, buffer),
      };

    case REPL_SELECT:
      return { ...state, activeRepl: action.component };

    case REPL_CLEAR:
      return {
        ...state,
        buffers: state.buffers.set(action.component, new List()),
      };

    default:
      return state;
  }
};

const outputAppend = (buffer, limit, line) => {
  buffer = buffer.push(line);
  if (buffer.size > limit) {
    buffer = buffer.shift();
  }
  return buffer;
};

export default repl;
