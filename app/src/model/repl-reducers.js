import { Map, List } from 'immutable';
import {
    REPL_CONNECT_DIAL,
    REPL_CONNECT_FAILURE,
    REPL_CONNECT_SUCCESS,
    REPL_CONNECT_CLOSE,
    REPL_RECEIVE,
    REPL_SEND,
    REPL_SELECT,
} from './repl-actions';

/*
-- shape of the repl connection and scrollback buffer state

repl: {
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
    connections: new Map(),
    buffers: new Map(),
    history: new Map(),
}

const repl = (state = initialReplState, action) => {
    let conn = state.connections.get(action.component);
    var changes, history;

    switch (action.type) {
    case REPL_CONNECT_DIAL:
        console.log("Connecting to [", action.component, "] ", action.endpoint)
        let details = new Map({
            url: action.endpoint,
            socket: undefined,
            error: undefined
        });
        return { ...state, connections: state.connections.set(action.component, details) };
    
    case REPL_CONNECT_FAILURE:
        // let conn = state.connections.get(action.component);
        changes = new Map({
            socket: undefined, // ensure this goes away
            error: action.error,
        });
        return { ...state, connections: state.connections.set(action.component, conn.merge(changes)) };

    case REPL_CONNECT_CLOSE:
        // let conn = state.connections.get(action.component);
        changes = new Map({
            socket: undefined,
            error: undefined,
        });
        return { ...state, connections: state.connections.set(action.component, conn.merge(changes)) };
    
    case REPL_CONNECT_SUCCESS:
        // let conn = state.connections.get(action.component);
        changes = new Map({
            socket: action.socket
        })
        return { 
            ...state, 
            connections: state.connections.set(action.component, conn.merge(changes)),
            buffers: state.buffers.set(action.component, new List()),
            history: state.history.set(action.component, new List()),
        };

    case REPL_RECEIVE:
        // console.log(action.component, action.data);
        var buffer = state.buffers.get(action.component)
        action.data.split("\n").forEach(line => {
            buffer = buffer.push(line);
            if (buffer.size > state.scrollbackLimit) {
                buffer = buffer.shift();
            }
        });
        /*
        var lines = state.buffers.get(action.component).push(action.data);
        if (lines.size > state.scrollbackLimit) {
            lines = lines.shift();
        }
        */
        return { 
            ...state, 
            buffers: state.buffers.set(action.component, buffer),
        };

    case REPL_SEND:
        let socket = conn.get('socket');
        socket.send(action.value + "\n");
        history = state.history.get(action.component).unshift(action.value)
        return {
            ...state,
            history: state.history.set(action.component, history)
        };

    case REPL_SELECT:
        return { ...state, activeRepl: action.component }

    default:
        return state;
    }
};

export default repl;