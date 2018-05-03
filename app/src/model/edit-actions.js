export const ROOT_LIST_REQUEST = 'ROOT_LIST_REQUEST';
export const ROOT_LIST_SUCCESS = 'ROOT_LIST_SUCCESS';
export const ROOT_LIST_FAILURE = 'ROOT_LIST_FAILURE';

export const BUFFER_READ_REQUEST = 'BUFFER_READ_REQUEST';
export const BUFFER_READ_SUCCESS = 'BUFFER_READ_SUCCESS';
export const BUFFER_READ_FAILURE = 'BUFFER_READ_FAILURE';

export const DIRECTORY_READ_REQUEST = 'DIRECTORY_READ_REQUEST';
export const DIRECTORY_READ_SUCCESS = 'DIRECTORY_READ_SUCCESS';
export const DIRECTORY_READ_FAILURE = 'DIRECTORY_READ_FAILURE';

export const BUFFER_CHANGE = 'BUFFER_CHANGE';
export const BUFFER_SELECT = 'BUFFER_SELECT';

export const BUFFER_SAVE_REQUEST = 'BUFFER_SAVE_REQUEST';
export const BUFFER_SAVE_SUCCESS = 'BUFFER_SAVE_SUCCESS';
export const BUFFER_SAVE_FAILURE = 'BUFFER_SAVE_FAILURE';

export const SCRIPT_NEW = 'SCRIPT_NEW';
export const SCRIPT_DUPLICATE = 'SCRIPT_DUPLICATE';

export const RESOURCE_RENAME_REQUEST = 'RESOURCE_RENAME_REQUEST';
export const RESOURCE_RENAME_SUCCESS = 'RESOURCE_RENAME_SUCCESS';
export const RESOURCE_RENAME_FAILURE = 'RESOURCE_RENAME_FAILURE';

export const RESOURCE_DELETE_REQUEST = 'RESOURCE_DELETE_REQUEST';
export const RESOURCE_DELETE_SUCCESS = 'RESOURCE_DELETE_SUCCESS';
export const RESOURCE_DELETE_FAILURE = 'RESOURCE_DELETE_FAILURE';

export const DIRECTORY_CREATE_REQUEST = 'DIRECTORY_CREATE_REQUEST';
export const DIRECTORY_CREATE_SUCCESS = 'DIRECTORY_CREATE_SUCCESS';
export const DIRECTORY_CREATE_FAILURE = 'DIRECTORY_CREATE_FAILURE';

export const TOOL_INVOKE = 'TOOL_INVOKE';

export const EXPLORER_TOGGLE_NODE = 'EXPLORER_TOGGLE_NODE';
export const EXPLORER_ACTIVE_NODE = 'EXPLORER_ACTIVE_NODE';

//
// sync actions
//

export const rootListRequest = name => ({ type: ROOT_LIST_REQUEST, name });

export const rootListSuccess = (name, value) => ({ type: ROOT_LIST_SUCCESS, name, value });

export const rootListFailure = (name, error) => ({ type: ROOT_LIST_FAILURE, name, error });

export const bufferReadRequest = resource => ({ type: BUFFER_READ_REQUEST, resource });

export const bufferReadSuccess = (resource, value, contentType) => ({
  type: BUFFER_READ_SUCCESS, resource, value, contentType,
});

export const bufferReadFailure = (resource, error) => ({ type: BUFFER_READ_FAILURE, resource, error });

export const directoryReadRequest = resource => ({ type: DIRECTORY_READ_REQUEST, resource });

export const directoryReadSuccess = (resource, value) => ({ type: DIRECTORY_READ_SUCCESS, resource, value });

export const directoryReadFailure = (resource, error) => ({ type: DIRECTORY_READ_FAILURE, resource, error });

export const bufferSaveRequest = (resource, value) => ({ type: BUFFER_SAVE_REQUEST, resource, value });

export const bufferSaveSuccess = (resource, value) => ({ type: BUFFER_SAVE_SUCCESS, resource, value });

export const bufferSaveFailure = (resource, error) => ({ type: BUFFER_SAVE_FAILURE, resource, error });

export const bufferChange = (resource, value) => ({ type: BUFFER_CHANGE, resource, value });

export const bufferSelect = resource => ({ type: BUFFER_SELECT, resource });

export const scriptNew = (siblingResource, value, name, category) => ({
  type: SCRIPT_NEW, siblingResource, value, name, category,
});

export const scriptDuplicate = resource => ({ type: SCRIPT_DUPLICATE, resource });

export const resourceRenameRequest = (resource, name) => ({ type: RESOURCE_RENAME_REQUEST, resource, name });

export const resourceRenameSuccess = (resource, newName, newResource) => ({
  type: RESOURCE_RENAME_SUCCESS, resource, newName, newResource,
});

export const resourceRenameFailure = (resource, name, error) => ({
  type: RESOURCE_RENAME_FAILURE, resource, name, error,
});

export const directoryCreateRequest = (siblingResource, name) => ({ type: DIRECTORY_CREATE_REQUEST, siblingResource, name });

export const directoryCreateSuccess = resource => ({ type: DIRECTORY_CREATE_SUCCESS, resource });

export const directoryCreateFailure = (resource, error) => ({ type: DIRECTORY_CREATE_FAILURE, resource, error });

export const resourceDeleteRequest = resource => ({ type: RESOURCE_DELETE_REQUEST, resource });

export const resourceDeleteSuccess = resource => ({ type: RESOURCE_DELETE_SUCCESS, resource });

export const resourceDeleteFailure = (resource, error) => ({ type: RESOURCE_DELETE_FAILURE, resource, error });


export const toolInvoke = name => ({ type: TOOL_INVOKE, name });

export const explorerActiveNode = node => ({ type: EXPLORER_ACTIVE_NODE, node });

export const explorerToggleNode = (node, toggled) => ({ type: EXPLORER_TOGGLE_NODE, node, toggled });

//
// async actions
//

export const rootList = (rootName, api) => (dispatch) => {
  dispatch(rootListRequest(rootName));
  return api.listRoot(rootName, (response) => {
    if (response.ok) {
      response.json().then((data) => {
        dispatch(rootListSuccess(rootName, data));
      });
    } else {
      dispatch(rootListFailure(rootName));
    }
  });
};

export const bufferRead = (api, resource) => (dispatch) => {
  dispatch(bufferReadRequest(resource));
  fetch(resource).then((response) => {
    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      if (contentType.includes('text')) {
        response.text().then((content) => {
          dispatch(bufferReadSuccess(resource, content, contentType));
        });
      } else {
        response.blob().then((content) => {
          dispatch(bufferReadSuccess(resource, content, contentType));
        });
      }
    } else {
      dispatch(bufferReadFailure(resource));
    }
  }).catch((error) => {
    dispatch(bufferReadFailure(resource, error));
  });
};

export const directoryRead = (api, resource) => (dispatch) => {
  dispatch(directoryReadRequest(resource));
  fetch(resource).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        dispatch(directoryReadSuccess(resource, data));
      });
    } else {
      dispatch(directoryReadFailure(resource));
    }
  })
    .catch((error) => {
      dispatch(directoryReadFailure(resource, error));
    });
};

export const bufferSave = (api, resource, value, cb) => (dispatch) => {
  dispatch(bufferSaveRequest(resource, value));
  return api.writeTextResource(resource, value, (response) => {
    // FIXME: handle errors
    dispatch(bufferSaveSuccess(resource, response.entity));
    cb && cb();
  });
};

export const resourceDelete = (api, resource, cb) => (dispatch) => {
  dispatch(resourceDeleteRequest(resource));
  return api.deleteResource(resource, (response) => {
    // FIXME: handle errors
    dispatch(resourceDeleteSuccess(resource, response.entity));
    cb && cb();
  });
};

export const resourceRename = (api, resource, name, virtual) => (dispatch) => {
  dispatch(resourceRenameRequest(resource, name));
  if (virtual) {
    dispatch(resourceRenameSuccess(resource, name, undefined));
  } else {
    api.renameResource(resource, name, (response) => {
      if (response.ok) {
        response.json().then((data) => {
          dispatch(resourceRenameSuccess(resource, name, data.url));
        });
      } else {
        dispatch(resourceRenameFailure(resource, name, undefined));
      }
    });
  }
};

export const directoryCreate = (api, sibling, name, cb) => (dispatch) => {
  dispatch(directoryCreateRequest(sibling, name));
  // this is wrong
  return api.createFolder(sibling, name, (response) => {
    // handle errors?
    dispatch(directoryCreateSuccess(response.entity));
    cb && cb();
  });
};
