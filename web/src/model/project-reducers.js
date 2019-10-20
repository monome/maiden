import { Map, List, fromJS } from 'immutable';
import {
  CATALOG_SUMMARY_SUCCESS,
  CATALOG_SUCCESS,
  CATALOG_FAILURE,
  CATALOG_UPDATE_REQUEST,
  CATALOG_UPDATE_SUCCESS,
  CATALOG_UPDATE_FAILURE,
  PROJECT_SUMMARY_SUCCESS,
  PROJECT_SUCCESS,
  PROJECT_VIEW_SELECT,
  PROJECT_INSTALL_REQUEST,
  PROJECT_INSTALL_SUCCESS,
  PROJECT_INSTALL_FAILURE,
  PROJECT_UPDATE_REQUEST,
  PROJECT_UPDATE_SUCCESS,
  PROJECT_UPDATE_FAILURE,
  PROJECT_REMOVE_REQUEST,
  PROJECT_REMOVE_SUCCESS,
  PROJECT_REMOVE_FAILURE,
  installID,
} from './project-actions';

/*

project: {
  activeComponent: <name>,
  catalogSummary: List({}),
  catalogs Map({
    <catalogName>: Map({ ...details... })
  }),
  projectSummary: Map({
    <projectName>: Map({ ...details... })
  }),
}

*/

const initialProjectState = {
  activeComponent: 'installed',
  catalogSummary: new List(),
  catalogs: new Map(),
  projectSummary: new Map(),
  installing: new Map(),
  mutating: new Map(),
};

const handleCatalogSummarySuccess = (action, state) => {
  const sortedCatalogs = action.catalogs.get('catalogs').sort((a, b) => {
    const na = a.get('name');
    const nb = b.get('name');
    if (na < nb)   { return -1; }
    if (na > nb)   { return 1; }
    return 0;
  });
  return { ...state, catalogSummary: sortedCatalogs };
}

const handleCatalogGetSuccess = (action, state) => {
  const catalogName = action.catalog.get('name');
  const sortedEntries = action.catalog.get('entries').sort((a, b) => {
    const na = a.get('project_name');
    const nb = b.get('project_name');
    if (na < nb)   { return -1; }
    if (na > nb)   { return 1; }
    return 0;
  });
  const sortedCatalog = action.catalog.set('entries', sortedEntries);
  const newCatalogs = state.catalogs.set(catalogName, sortedCatalog);
  return { ...state, catalogs: newCatalogs };
}

const projects = (state = initialProjectState, action) => {
  switch (action.type) {
    case CATALOG_SUMMARY_SUCCESS:
      return handleCatalogSummarySuccess(action, state)

    case CATALOG_SUCCESS:
      return handleCatalogGetSuccess(action, state)

    case CATALOG_FAILURE:
      // TODO:
      // MAINT: this is ugly, the catalog summary will contain faux entries
      // which correspond to sources which haven't been fetched. Here we treat a
      // catalog get failure as just an empty catalog so that the per-catalog
      // update/refresh ui can be used
      console.log('creating empty catalog: ', action.error.name);
      const emptyCatalog = fromJS({
        'url': action.error.url,
        'entries': [],
        'name': action.error.name,
      });
      return { ...state,
        catalogs: state.catalogs.set(action.error.name, emptyCatalog),
      };

    case CATALOG_UPDATE_REQUEST:
      // TODO:
      return state;

    case CATALOG_UPDATE_SUCCESS:
      return handleCatalogGetSuccess(action, state);

    case CATALOG_UPDATE_FAILURE:
      // TODO:
      return state;

    case PROJECT_SUMMARY_SUCCESS:
      return { ...state, projectSummary: action.projects };

    case PROJECT_SUCCESS:
      const projectName = action.project.get('name');
      const newProjects = state.projects.set(projectName, action.project);
      return { ...state, projects: newProjects };

    case PROJECT_VIEW_SELECT:
      return { ...state, activeComponent: action.component };

    case PROJECT_INSTALL_REQUEST:
      return { ...state,
        installing: state.installing.set(installID(action.catalog, action.name), 'installing...'),
      };

    case PROJECT_INSTALL_FAILURE:
      return { ...state,
        installing: state.installing.set(installID(action.catalog, action.name), action.error.error),
      };

    case PROJECT_INSTALL_SUCCESS:
      return { ...state,
        installing: state.installing.delete(installID(action.catalog, action.name)),
      };

    case PROJECT_UPDATE_REQUEST:
      return { ...state,
        mutating: state.mutating.set(action.project, 'updating...'),
      };

    case PROJECT_UPDATE_FAILURE:
      return { ...state,
        mutating: state.mutating.set(action.project, action.error.error),
      };

    case PROJECT_UPDATE_SUCCESS:
      return { ...state,
        mutating: state.mutating.delete(action.project),
      };

    case PROJECT_REMOVE_REQUEST:
      return { ...state,
        mutating: state.mutating.set(action.project, 'removing...'),
      };

    case PROJECT_REMOVE_FAILURE:
      return { ...state,
        mutating: state.mutating.set(action.project, action.error.error),
      };

    case PROJECT_REMOVE_SUCCESS:
      return { ...state,
        mutating: state.mutating.delete(action.project),
      };

    default:
      return state;
  }
};

export default projects;