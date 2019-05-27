import { Map } from 'immutable';
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

//
// async actions
//

export const getCatalogSummary = cb => dispatch => {
  dispatch(catalogSummaryRequest());
  return API.getCatalogSummary(catalogs => {
    const cs = new Map(catalogs);
    dispatch(catalogSummarySuccess(cs));
    if (cb) {
      cb(cs);
    }
  });
};

export const getCatalog = cb => dispatch => {
  dispatch(catalogRequest());
  return API.getCatalog(catalog => {
    const c = new Map(catalog);
    dispatch(catalogSuccess(c));
    if (cb) {
      cb(c);
    }
  });
};

export const getProjectSummary = cb => dispatch => {
  dispatch(projectSummaryRequest());
  return API.getProjectSummary(projects => {
    const ps = new Map(projects);
    dispatch(projectSummarySuccess(ps));
    if (cb) {
      cb(ps);
    }
  });
};

export const getProject = cb => dispatch => {
  dispatch(projectRequest());
  return API.getProject(project => {
    const p = new Map(project);
    dispatch(projectSuccess(p));
    if (cb) {
      cb(p);
    }
  });
};
