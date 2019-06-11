import { fromJS } from 'immutable';
import API from '../api';

export const CATALOG_SUMMARY_REQUEST = 'CATALOG_SUMMARY_REQUEST';
export const CATALOG_SUMMARY_SUCCESS = 'CATALOG_SUMMARY_SUCCESS';
export const CATALOG_SUMMARY_FAILURE = 'CATALOG_SUMMARY_FAILURE';

export const CATALOG_REQUEST = 'CATALOG_REQUEST';
export const CATALOG_SUCCESS = 'CATALOG_SUCCESS';
export const CATALOG_FAILURE = 'CATALOG_FAILURE';

export const PROJECT_SUMMARY_REQUEST = 'PROJECT_SUMMARY_REQUEST';
export const PROJECT_SUMMARY_SUCCESS = 'PROJECT_SUMMARY_SUCCESS';
export const PROJECT_SUMMARY_FAILURE = 'PROJECT_SUMMARY_FAILURE';

export const PROJECT_REQUEST = 'PROJECT_REQUEST';
export const PROJECT_SUCCESS = 'PROJECT_SUCCESS';
export const PROJECT_FAILURE = 'PROJECT_FAILURE';

export const PROJECT_VIEW_SELECT = 'PROJECT_VIEW_SELECT';

export const PROJECT_INSTALL_REQUEST = 'PROJECT_INSTALL_REQUEST';
export const PROJECT_INSTALL_SUCCESS = 'PROJECT_INSTALL_SUCCESS';
export const PROJECT_INSTALL_FAILURE = 'PROJECT_INSTALL_FAILURE';

export const PROJECT_UPDATE_REQUEST = 'PROJECT_UPDATE_REQUEST';
export const PROJECT_UPDATE_SUCCESS = 'PROJECT_UPDATE_SUCCESS';
export const PROJECT_UPDATE_FAILURE = 'PROJECT_UPDATE_FAILURE';

export const PROJECT_REMOVE_REQUEST = 'PROJECT_REMOVE_REQUEST';
export const PROJECT_REMOVE_SUCCESS = 'PROJECT_REMOVE_SUCCESS';
export const PROJECT_REMOVE_FAILURE = 'PROJECT_REMOVE_FAILURE';

//
// sync action creators
//

export const catalogSummaryRequest = () => ({ type: CATALOG_SUMMARY_REQUEST });
export const catalogSummarySuccess = catalogs => ({ type: CATALOG_SUMMARY_SUCCESS, catalogs });
export const catalogSummaryFailure = error => ({ type: CATALOG_SUMMARY_FAILURE, error });

export const catalogRequest = () => ({ type: CATALOG_REQUEST });
export const catalogSuccess = catalog => ({ type: CATALOG_SUCCESS, catalog });
export const catalogFailure = error => ({ type: CATALOG_FAILURE, error });

export const projectSummaryRequest = () => ({ type: PROJECT_SUMMARY_REQUEST });
export const projectSummarySuccess = projects => ({ type: PROJECT_SUMMARY_SUCCESS, projects });
export const projectSummaryFailure = error => ({ type: PROJECT_SUMMARY_FAILURE, error });

export const projectRequest = () => ({ type: PROJECT_REQUEST });
export const projectSuccess = project => ({ type: PROJECT_SUCCESS, project });
export const projectFailure = error => ({ type: PROJECT_FAILURE, error });

export const projectViewSelect = component => ({ type: PROJECT_VIEW_SELECT, component });

export const projectInstallRequest = (catalog, name) => ({ type: PROJECT_INSTALL_REQUEST, catalog, name });
export const projectInstallSuccess = project => ({ type: PROJECT_INSTALL_SUCCESS, project });
export const projectInstallFailure = error => ({ type: PROJECT_INSTALL_FAILURE, error });

export const projectUpdateRequest = project => ({ type: PROJECT_UPDATE_REQUEST, project });
export const projectUpdateSuccess = project => ({ type: PROJECT_UPDATE_SUCCESS, project });
export const projectUpdateFailure = error => ({ type: PROJECT_UPDATE_FAILURE, error });

export const projectRemoveRequest = project => ({ type: PROJECT_REMOVE_REQUEST, project });
export const projectRemoveSuccess = project => ({ type: PROJECT_REMOVE_SUCCESS, project });
export const projectRemoveFailure = error => ({ type: PROJECT_REMOVE_FAILURE, error });

//
// async actions
//

export const getCatalogSummary = cb => dispatch => {
  dispatch(catalogSummaryRequest());
  return API.getCatalogSummary(catalogs => {
    const cs = fromJS(catalogs);
    dispatch(catalogSummarySuccess(cs));
    if (cb) {
      cb(cs);
    }
  });
};

export const getCatalog = (name, cb) => dispatch => {
  dispatch(catalogRequest());
  return API.getCatalog(name, catalog => {
    const c = fromJS(catalog);
    dispatch(catalogSuccess(c));
    if (cb) {
      cb(c);
    }
  });
};

export const getProjectSummary = cb => dispatch => {
  dispatch(projectSummaryRequest());
  return API.getProjectSummary(projects => {
    const ps = fromJS(projects);
    dispatch(projectSummarySuccess(ps));
    if (cb) {
      cb(ps);
    }
  });
};

export const getProject = (name, cb) => dispatch => {
  dispatch(projectRequest());
  return API.getProject(name, project => {
    const p = fromJS(project);
    dispatch(projectSuccess(p));
    if (cb) {
      cb(p);
    }
  });
};

export const installProject = (catalog, name, onSuccess, onFailure) => dispatch => {
  dispatch(projectInstallRequest(catalog, name));
  return API.installProject(catalog, name,
    successResult => {
      dispatch(projectInstallSuccess(successResult));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectInstallFailure(failureResult));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const updateProject = (project, onSuccess, onFailure) => dispatch => {
  dispatch(projectUpdateRequest(project));
  return API.updateProject(project, 
    successResult => {
      dispatch(projectUpdateSuccess(successResult));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectUpdateFailure(failureResult));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const removeProject = (project, onSuccess, onFailure) => dispatch => {
  dispatch(projectRemoveRequest(project));
  return API.removeProject(project,
    successResult => {
      dispatch(projectRemoveSuccess(successResult));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectRemoveFailure(failureResult));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};


