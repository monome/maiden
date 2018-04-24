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

export const SCRIPT_RENAME_REQUEST = 'SCRIPT_RENAME_REQUEST'
export const SCRIPT_RENAME_SUCCESS = 'SCRIPT_RENAME_SUCCESS'
export const SCRIPT_RENAME_FAILURE = 'SCRIPT_RENAME_FAILURE'

export const SCRIPT_DELETE_REQUEST = 'SCRIPT_DELETE_REQUEST'
export const SCRIPT_DELETE_SUCCESS = 'SCRIPT_DELETE_SUCCESS'
export const SCRIPT_DELETE_FAILURE = 'SCRIPT_DELETE_FAILURE'

export const SCRIPT_NEW_FOLDER_REQUEST = 'SCRIPT_NEW_FOLDER_REQUEST'
export const SCRIPT_NEW_FOLDER_SUCCESS = 'SCRIPT_NEW_FOLDER_SUCCESS'
export const SCRIPT_NEW_FOLDER_FAILURE = 'SCRIPT_NEW_FOLDER_FAILURE'

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

export const scriptNew = (siblingResource, value, name) => {
    return { type: SCRIPT_NEW, siblingResource, value, name }
}

export const scriptDuplicate = (resource) => {
    return { type: SCRIPT_DUPLICATE, resource }
}

export const scriptRenameRequest = (resource, name) => {
    return { type: SCRIPT_RENAME_REQUEST, resource, name }
}

export const scriptRenameSuccess = (resource, newName, newResource) => {
    return { type: SCRIPT_RENAME_SUCCESS, resource, newName, newResource }
}

export const scriptRenameFailure = (resource, name, error) => {
    return { type: SCRIPT_RENAME_FAILURE, resource, name, error }
}

export const scriptNewFolderRequest = (siblingResource, name) => {
    return { type: SCRIPT_NEW_FOLDER_REQUEST, siblingResource, name }
}

export const scriptNewFolderSuccess = (resource) => {
    return { type: SCRIPT_NEW_FOLDER_SUCCESS, resource }
}

export const scriptNewFolderFailure = (resource, error) => {
    return { type: SCRIPT_NEW_FOLDER_FAILURE, resource, error }
}

export const scriptDeleteRequest = (resource) => {
    return { type: SCRIPT_DELETE_REQUEST, resource }
}

export const scriptDeleteSuccess = (resource) => {
    return { type: SCRIPT_DELETE_SUCCESS, resource }
}

export const scriptDeleteFailure = (resource, error) => {
    return { type: SCRIPT_DELETE_FAILURE, resource, error }
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
        return api.listScripts((response) => {
            if (response.ok) {
                response.json().then(data => {
                    dispatch(scriptListSuccess(data))
                })
            } else {
                dispatch(scriptListFailure())
            }
        })
    }
}

export const scriptRead = (api, resource) => {
    return (dispatch) => {
        dispatch(scriptReadRequest(resource))
        fetch(resource).then((response) => {
            if (response.ok) {
                response.text().then(content => {
                    dispatch(scriptReadSuccess(resource, content));
                })
            } else {
                dispatch(scriptReadFailure(resource));
            }
        }).catch(error => {
            dispatch(scriptReadFailure(resource, error));
        })
    }
}

export const scriptDirRead = (api, resource) => {
    return (dispatch) => {
        dispatch(scriptDirRequest(resource))
        fetch(resource).then(response => {
            if (response.ok) {
                response.json().then(data => {
                    dispatch(scriptDirSuccess(resource, data));
                })
            } else {
                dispatch(scriptDirFailure(resource));
            }
        })
        .catch(error => {
            dispatch(scriptDirFailure(resource, error));
        })
    }
}

export const scriptSave = (api, resource, value, cb) => {
    return (dispatch) => {
        dispatch(scriptSaveRequest(resource, value))
        return api.writeScript(resource, value, (response) => {
            // FIXME: handle errors
            dispatch(scriptSaveSuccess(resource, response.entity))
            cb && cb()
        })
    }
}

export const scriptDelete = (api, resource, cb) => {
    return (dispatch) => {
        dispatch(scriptDeleteRequest(resource))
        return api.deleteScript(resource, (response) => {
            // FIXME: handle errors
            dispatch(scriptDeleteSuccess(resource, response.entity))
            cb && cb()
        })
    }
}

export const scriptRename = (api, resource, name, virtual) => {
    return (dispatch) => {
        dispatch(scriptRenameRequest(resource, name));
        if (virtual) {
            dispatch(scriptRenameSuccess(resource, name, undefined))
        } else {
            api.renameScript(resource, name, (response) => {
                if (response.ok) {
                    response.json().then(data => {
                        dispatch(scriptRenameSuccess(resource, name, data.url));
                    });
                } else {
                    dispatch(scriptRenameFailure(resource, name, undefined));
                }
            })
        }
    }
}

export const scriptNewFolder = (api, sibling, name, cb) => {
    return (dispatch) => {
        dispatch(scriptNewFolderRequest(sibling, name))
        // this is wrong
        return api.createFolder(sibling, name, (response) => {
            // handle errors?
            dispatch(scriptNewFolderSuccess(response.entity))
            cb && cb()
        })
    }
}
