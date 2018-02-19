export const SCRIPT_LIST_REQUEST = 'SCRIPT_LIST_REQUEST'
export const SCRIPT_LIST_SUCCESS = 'SCRIPT_LIST_SUCCESS'
export const SCRIPT_LIST_FAILURE = 'SCRIPT_LIST_FAILURE'

export const SCRIPT_READ_REQUEST = 'SCRIPT_READ_REQUEST'
export const SCRIPT_READ_SUCCESS = 'SCRIPT_READ_SUCCESS'
export const SCRIPT_READ_FAILURE = 'SCRIPT_READ_FAILURE'

export const SCRIPT_DIR_REQUEST = 'SCRIPT_DIR_REQUEST'
export const SCRIPT_DIR_SUCCESS = 'SCRIPT_DIR_SUCCESS'
export const SCRIPT_DIR_FAILURE = 'SCRIPT_DIR_FAILURE'

export const SCRIPT_CHANGE = 'SCRIPT_CHANGE'

export const SCRIPT_SAVE_REQUEST = 'SCRIPT_SAVE_REQUEST'
export const SCRIPT_SAVE_SUCCESS = 'SCRIPT_SAVE_SUCCESS'
export const SCRIPT_SAVE_FAILURE = 'SCRIPT_SAVE_FAILURE'

export const SCRIPT_SELECT = 'SCRIPT_SELECT'
export const SCRIPT_NEW = 'SCRIPT_NEW'
export const SCRIPT_DUPLICATE = 'SCRIPT_DUPLICATE'
export const SCRIPT_RENAME = 'SCRIPT_RENAME'
export const SCRIPT_DELETE = 'SCRIPT_DELETE'

export const TOOL_INVOKE = 'TOOL_INVOKE'

export const EXPLORER_TOGGLE_NODE = 'EXPLORER_TOGGLE_NODE'
export const EXPLORER_ACTIVE_NODE = 'EXPLORER_ACTIVE_NODE'

//
// sync actions
//

export const scriptListRequest = () => {
    return { type: SCRIPT_LIST_REQUEST }
}

export const scriptListSuccess = (value) => {
    return { type: SCRIPT_LIST_SUCCESS, value }
}

export const scriptListFailure = (error) => {
    return { type: SCRIPT_LIST_FAILURE, error }
}

export const scriptReadRequest = (resource) => {
    return { type: SCRIPT_READ_REQUEST, resource }
}

export const scriptReadSuccess = (resource, value) => {
    return { type: SCRIPT_READ_SUCCESS, resource, value }
}

export const scriptReadFailure = (resource, error) => {
    return { type: SCRIPT_READ_FAILURE, resource, error }
}

export const scriptDirRequest = (resource) => {
    return { type: SCRIPT_DIR_REQUEST, resource }
}

export const scriptDirSuccess = (resource, value) => {
    return { type: SCRIPT_DIR_SUCCESS, resource, value }
}

export const scriptDirFailure = (resource, error) => {
    return { type: SCRIPT_DIR_FAILURE, resource, error }
}

export const scriptSaveRequest = (resource, value) => {
    return { type: SCRIPT_SAVE_REQUEST, resource, value }
}

export const scriptSaveSuccess = (resource, value) => {
    return { type: SCRIPT_SAVE_SUCCESS, resource, value }
}

export const scriptSaveFailure = (resource, error) => {
    return { type: SCRIPT_SAVE_FAILURE, resource, error }
}

export const scriptChange = (resource, value) => {
    return { type: SCRIPT_CHANGE, resource, value }
}

export const scriptSelect = (resource) => {
    return { type: SCRIPT_SELECT, resource }
}

export const scriptNew = (siblingResource, value) => {
    return { type: SCRIPT_NEW, siblingResource, value }
}

export const scriptDuplicate = (resource) => {
    return { type: SCRIPT_DUPLICATE, resource }
}

export const scriptDelete = (resource) => {
    return { type: SCRIPT_DELETE, resource }
}

export const toolInvoke = (name) => {
    return { type: TOOL_INVOKE, name }
}

export const explorerActiveNode = (node) => {
    return { type: EXPLORER_ACTIVE_NODE, node }
}

export const explorerToggleNode = (node, toggled) => {
    return { type: EXPLORER_TOGGLE_NODE, node, toggled }
}

//
// async actions
//

export const scriptList = (api) => {
    return (dispatch) => {
        dispatch(scriptListRequest());
        return api.list_scripts((response) => {
            // FIXME: handle errors
            dispatch(scriptListSuccess(response.entity))
        })
    }
}

export const scriptRead = (api, resource) => {
    return (dispatch) => {
        dispatch(scriptReadRequest(resource))
        return api.read_script(resource, (response) => {
            // FIXME: handle errors
            dispatch(scriptReadSuccess(resource, response.entity))
        })
    }
}

export const scriptDirRead = (api, resource) => {
    return (dispatch) => {
        dispatch(scriptDirRequest(resource))
        return api.read_script(resource, (response) => {
            // FIXME: handle errors
            dispatch(scriptDirSuccess(resource, response.entity))
        })
    }
}

export const scriptSave = (api, resource, value, cb) => {
    return (dispatch) => {
        dispatch(scriptSaveRequest(resource, value))
        return api.write_script(resource, value, (response) => {
            // FIXME: handle errors
            dispatch(scriptSaveSuccess(resource, response.entity))
            cb()
        })
    }
}

