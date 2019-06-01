import { Map } from 'immutable';
import {
  CATALOG_SUMMARY_SUCCESS,
  CATALOG_SUCCESS,
  PROJECT_SUMMARY_SUCCESS,
  PROJECT_SUCCESS,
  PROJECT_VIEW_SELECT,
} from './project-actions';

/*

project: {
  activeComponent: <name>,
  catalogSummary: Map ({}),
  catalogs Map({
    <catalogName>: Map({ ...details... })
  }),
  projectSummary: Map ({}),
  projects Map({
    <projectName>: Map({ ...details... })
  }),


}

*/

const initialProjectState = {
  activeComponent: 'project',
  catalogSummary: new Map(),
  catalogs: new Map(),
  projectSummary: new Map(),
  projects: new Map(),
};

const projects = (state = initialProjectState, action) => {
  switch (action.type) {
    case CATALOG_SUMMARY_SUCCESS:
      return { ...state, catalogSummary: action.catalogs };

    case CATALOG_SUCCESS:
      const catalogName = action.catalog.get('name');
      const newCatalogs = state.catalogs.set(catalogName, action.catalog);
      return { ...state, catalogs: newCatalogs };

    case PROJECT_SUMMARY_SUCCESS:
      return { ...state, projectSummary: action.projects };

    case PROJECT_SUCCESS:
      const projectName = action.project.get('name');
      const newProjects = state.projects.set(projectName, action.project);
      return { ...state, projects: newProjects };

    case PROJECT_VIEW_SELECT:
      return { ...state, activeComponent: action.component };

      default:
      return state;
  }
};

export default projects;