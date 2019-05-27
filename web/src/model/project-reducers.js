import { Map } from 'immutable';
import {
  CATALOG_SUMMARY_SUCCESS,
  CATALOG_SUCCESS,
  PROJECT_SUMMARY_SUCCESS,
  PROJECT_SUCCESS,
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
  activeComponent: 'installed',
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
      const newCatalogs = state.catalogs.set(action.catalog.name, action.catalog);
      return { ...state, catalogs: newCatalogs };

    case PROJECT_SUMMARY_SUCCESS:
      return { ...state, projectSummary: action.projects };

    case PROJECT_SUCCESS:
      const newProjects = state.projects.set(action.project.name, action.project);
      return { ...state, projects: newProjects };

    default:
      return state;
  }
};

export default projects;