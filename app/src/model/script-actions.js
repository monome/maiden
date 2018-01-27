export const SCRIPT_LIST_REQUEST = 'SCRIPT_LIST_REQUEST'
export const SCRIPT_LIST_SUCCESS = 'SCRIPT_LIST_SUCCESS'
export const SCRIPT_LIST_FAILURE = 'SCRIPT_LIST_FAILURE'

export const SCRIPT_READ_REQUEST = 'SCRIPT_READ_REQUEST'
export const SCRIPT_READ_SUCCESS = 'SCRIPT_READ_SUCCESS'
export const SCRIPT_READ_FAILURE = 'SCRIPT_READ_FAILURE'

export const SCRIPT_CHANGE = 'SCRIPT_CHANGE'

export const SCRIPT_SAVE_REQUEST = 'SCRIPT_SAVE_REQUEST'
export const SCRIPT_SAVE_SUCESS = 'SCRIPT_SAVE_SUCCESS'
export const SCRIPT_SAVE_FAILURE = 'SCRIPT_SAVE_FAILURE'

export const SCRIPT_SELECT = 'SCRIPT_SELECT'

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


export const scriptChange = (resource, value) => {
    return { type: SCRIPT_CHANGE, resource, value }
}

export const scriptSelect = (resource) => {
    return { type: SCRIPT_SELECT, resource }
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
        dispatch(scriptReadRequest(resource));
        return api.read_script(resource, (response) => {
            // FIXME: handle errors
            dispatch(scriptReadSuccess(resource, response.entity))
        })
    }
}