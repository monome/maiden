import { fromJS } from 'immutable';
import API from '../api';

export const CATALOG_SUMMARY_REQUEST = 'CATALOG_SUMMARY_REQUEST';
export const CATALOG_SUMMARY_SUCCESS = 'CATALOG_SUMMARY_SUCCESS';
export const CATALOG_SUMMARY_FAILURE = 'CATALOG_SUMMARY_FAILURE';

export const CATALOG_REQUEST = 'CATALOG_REQUEST';
export const CATALOG_SUCCESS = 'CATALOG_SUCCESS';
export const CATALOG_FAILURE = 'CATALOG_FAILURE';

export const CATALOG_UPDATE_REQUEST = 'CATALOG_UPDATE_REQUEST';
export const CATALOG_UPDATE_SUCCESS = 'CATALOG_UPDATE_SUCCESS';
export const CATALOG_UPDATE_FAILURE = 'CATALOG_UPDATE_FAILURE';

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

export const catalogRequest = name => ({ type: CATALOG_REQUEST, name });
export const catalogSuccess = (name, catalog) => ({ type: CATALOG_SUCCESS, name, catalog });
export const catalogFailure = (name, error) => ({ type: CATALOG_FAILURE, name, error });

export const catalogUpdateRequest = url => ({ type: CATALOG_UPDATE_REQUEST, url });
export const catalogUpdateSuccess = (url, catalog) => ({ type: CATALOG_UPDATE_SUCCESS, url, catalog });
export const catalogUpdateFailure = error => ({ type: CATALOG_UPDATE_FAILURE, error });

export const projectSummaryRequest = () => ({ type: PROJECT_SUMMARY_REQUEST });
export const projectSummarySuccess = projects => ({ type: PROJECT_SUMMARY_SUCCESS, projects });
export const projectSummaryFailure = error => ({ type: PROJECT_SUMMARY_FAILURE, error });

export const projectRequest = () => ({ type: PROJECT_REQUEST });
export const projectSuccess = project => ({ type: PROJECT_SUCCESS, project });
export const projectFailure = error => ({ type: PROJECT_FAILURE, error });

export const projectViewSelect = component => ({ type: PROJECT_VIEW_SELECT, component });

export const projectInstallRequest = (catalog, name) => ({ type: PROJECT_INSTALL_REQUEST, catalog, name });
export const projectInstallSuccess = (project, catalog, name) => ({ type: PROJECT_INSTALL_SUCCESS, project, catalog, name });
export const projectInstallFailure = (error, catalog, name) => ({ type: PROJECT_INSTALL_FAILURE, error, catalog, name });

export const projectUpdateRequest = project => ({ type: PROJECT_UPDATE_REQUEST, project });
export const projectUpdateSuccess = project => ({ type: PROJECT_UPDATE_SUCCESS, project });
export const projectUpdateFailure = (error, project) => ({ type: PROJECT_UPDATE_FAILURE, error, project });

export const projectRemoveRequest = project => ({ type: PROJECT_REMOVE_REQUEST, project });
export const projectRemoveSuccess = project => ({ type: PROJECT_REMOVE_SUCCESS, project });
export const projectRemoveFailure = (error, project) => ({ type: PROJECT_REMOVE_FAILURE, error, project });

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

export const getCatalogByURL = (url, onSuccess, onFailure) => dispatch => {
  dispatch(catalogRequest(url));
  return API.getCatalogByURL(url, 
    successResponse => {
      const c = fromJS(successResponse);
      dispatch(catalogSuccess(url, c));
      if (onSuccess) {
        onSuccess(c);
      }
    },
    failureResult => {
      dispatch(catalogFailure(url, failureResult));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const getCatalog = (name, onSuccess, onFailure) => dispatch => {
  dispatch(catalogRequest(name));
  return API.getCatalog(name, 
    successResponse => {
      const c = fromJS(successResponse);
      dispatch(catalogSuccess(name, c));
      if (onSuccess) {
        onSuccess(c);
      }
    },
    failureResult => {
      dispatch(catalogFailure(name, failureResult));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const updateCatalog = (url, onSuccess, onFailure) => dispatch => {
  dispatch(catalogUpdateRequest(url));
  return API.updateCatalog(url, 
    successResponse => {
      const catalog = fromJS(successResponse);
      dispatch(catalogUpdateSuccess(url, catalog))
      if (onSuccess) {
        onSuccess(catalog);
      }
    },
    failureResult => {
      dispatch(catalogUpdateFailure(failureResult))
      if (onFailure) {
        onFailure(failureResult)
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
      dispatch(projectInstallSuccess(successResult, catalog, name));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectInstallFailure(failureResult, catalog, name));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const updateProject = (project, onSuccess, onFailure) => dispatch => {
  dispatch(projectUpdateRequest(project));
  return API.updateProject(project, 
    successResult => {
      dispatch(projectUpdateSuccess(successResult, project));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectUpdateFailure(failureResult, project));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

export const removeProject = (project, onSuccess, onFailure) => dispatch => {
  dispatch(projectRemoveRequest(project));
  return API.removeProject(project,
    successResult => {
      dispatch(projectRemoveSuccess(successResult, project));
      if (onSuccess) {
        onSuccess(successResult);
      }
    },
    failureResult => {
      dispatch(projectRemoveFailure(failureResult, project));
      if (onFailure) {
        onFailure(failureResult);
      }
    });
};

//
// helpers
//

export const installID = (catalog, name) => (
  `${name}::${catalog}`
);
