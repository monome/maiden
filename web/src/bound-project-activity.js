import { connect } from 'react-redux';
import ProjectActivity from './project-activity';

import {
  projectViewSelect,
  getCatalogSummary,
  getCatalog,
  getCatalogByURL,
  updateCatalog,
  updateAllCatalogs,
  getProjectSummary,
  getProject,
  installProject,
  updateAllProjects,
  updateProject,
  removeProject,
} from './model/project-actions';

import {
  directoryRead,
} from './model/edit-actions';

import { DUST_CODE_RESOURCE } from './api';

const mapStateToProps = state => {
  const { activeComponent, catalogSummary, catalogs, projectSummary, projects } = state.projects;
  return {
    activeComponent,
    catalogSummary,
    catalogs,
    projectSummary,
    projects,
  };
};

const mapDispatchToProps = dispatch => ({
  projectViewSelect: component => {
    dispatch(projectViewSelect(component));
  },
  getCatalogSummary: onSuccess => {
    dispatch(getCatalogSummary(onSuccess));
  },
  getCatalog: (name, onSuccess) => {
    dispatch(getCatalog(name, onSuccess));
  },
  getCatalogByURL: (url, onSuccess) => {
    dispatch(getCatalogByURL(url, onSuccess));
  },
  updateCatalog: (catalogURL, onSuccess, onFailure) => {
    dispatch(updateCatalog(catalogURL, onSuccess, onFailure));
  },
  updateAllCatalogs: (catalogSummary, onSuccess, onFailure) => {
    dispatch(updateAllCatalogs(catalogSummary, onSuccess, onFailure));
  },
  refreshCodeDir: () => {
    dispatch(directoryRead(DUST_CODE_RESOURCE));
  },
  getProjectSummary: onSuccess => {
    dispatch(getProjectSummary(onSuccess));
  },
  getProject: (name, onSuccess) => {
    dispatch(getProject(name, onSuccess));
  },
  installProject: (catalogURL, name, onSuccess, onFailure) => {
    dispatch(installProject(catalogURL, name, onSuccess, onFailure));
  },
  updateAllProjects: (projectList, onSuccess, onFailure) => {
    dispatch(updateAllProjects(projectList, onSuccess, onFailure));
  },
  updateProject: (projectURL, name, onSuccess, onFailure) => {
    dispatch(updateProject(projectURL, name, onSuccess, onFailure));
  },
  removeProject: (projectURL, name, onSuccess, onFailure) => {
    dispatch(removeProject(projectURL, name, onSuccess, onFailure));
  },
});

const BoundProjectActivity = connect(mapStateToProps, mapDispatchToProps)(ProjectActivity);

export default BoundProjectActivity;
