export const REPL_CONNECT_DIAL = 'REPL_CONNECT_DIAL'
export const REPL_CONNECT_SUCCESS = 'REPL_CONNECT_SUCCESS'
export const REPL_CONNECT_FAILURE = 'REPL_CONNECT_FAILURE'
export const REPL_CONNECT_CLOSE = 'REPL_CONNECT_CLOSE'

export const REPL_RECEIVE = 'REPL_RECEIVE'
export const REPL_SEND = 'REPL_SEND'

export const REPL_SELECT = 'REPL_SELECT'
export const REPL_CLEAR = 'REPL_CLEAR'

//
// sync action creators
//

export const replConnectDial = (component, endpoint) => {
    return { type: REPL_CONNECT_DIAL, component, endpoint }
}

export const replConnectSuccess = (component, socket) => {
    return { type: REPL_CONNECT_SUCCESS, component, socket }
}

export const replConnectFailure = (component, error) => {
    // console.log(error);
    return { type: REPL_CONNECT_FAILURE, component, error }
}

export const replConnectClose = (component) => {
    return { type: REPL_CONNECT_CLOSE, component }
}

export const replReceive = (component, data) => {
    return { type: REPL_RECEIVE, component, data }
}

export const replSend = (component, value) => {
    return { type: REPL_SEND, component, value }
}

export const replSelect = (component) => {
    return { type: REPL_SELECT, component }
}

export const replClear = (component) => {
    return { type: REPL_CLEAR, component }
}

//
// async actions
//

export const replConnect = (component, endpoint) => {
    return (dispatch) => {
        dispatch(replConnectDial(component, endpoint));
        const socket = new WebSocket(endpoint, ['bus.sp.nanomsg.org']);
        socket.onopen = (event) => {
            dispatch(replConnectSuccess(component, socket))
        }
        socket.onerror = (error) => {
            dispatch(replConnectFailure(component, error))
        }
        socket.onclose = (event) => {
            dispatch(replConnectClose(component))
        }
        socket.onmessage = (event) => {
            dispatch(replReceive(component, event.data))
        }
    }
}