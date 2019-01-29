import api from '../api';

export const EDITOR_CONFIG_REQUEST = 'EDITOR_CONFIG_REQUEST';
export const EDITOR_CONFIG_SUCCESS = 'EDITOR_CONFIG_SUCCESS';
export const EDITOR_CONFIG_FAILURE = 'EDITOR_CONFIG_FAILURE';

export const UPDATE_EDITOR_CONFIG_REQUEST = 'UPDATE_EDITOR_CONFIG_REQUEST';
export const UPDATE_EDITOR_CONFIG_SUCCESS = 'UPDATE_EDITOR_CONFIG_SUCCESS';

export const updateEditorConfigRequest = (resource, value) => ({
  type: UPDATE_EDITOR_CONFIG_REQUEST,
  resource,
  value,
});

export const updateEditorConfigSuccess = (resource, value) => ({
  type: UPDATE_EDITOR_CONFIG_SUCCESS,
  resource,
  value,
});

export const editorConfigRequest = resource => ({ type: EDITOR_CONFIG_REQUEST, resource });

export const editorConfigSuccess = (resource, value) => ({
  type: EDITOR_CONFIG_SUCCESS,
  resource,
  value,
});

export const editorConfigFailure = (resource, error) => ({
  type: EDITOR_CONFIG_FAILURE,
  resource,
  error,
});

//
// async actions
//

export const editorConfig = resource => dispatch => {
  dispatch(editorConfigRequest(resource));
  fetch(resource)
    .then(response => {
      if (response.ok) {
        // syntax error here means config/editor.json is
        // malformed.
        response.json().then(content => {
          dispatch(editorConfigSuccess(resource, content));
        });
      } else {
        dispatch(editorConfigFailure(resource, response));
      }
    })
    .catch(error => {
      dispatch(editorConfigFailure(resource, error));
    });
};

export const updateEditorConfig = (resource, value) => dispatch => {
  dispatch(updateEditorConfigRequest(resource, value));
  api.writeJSONResource(resource, value, () => {
    // FIXME: handle errors
    dispatch(updateEditorConfigSuccess(resource, value));
  });
};
