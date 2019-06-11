import { connect } from 'react-redux';
import ProjectActivity from './project-activity';

import {
  projectViewSelect,
  getCatalogSummary,
  getCatalog,
  getProjectSummary,
  getProject,
  installProject,
  updateProject,
  removeProject,
} from './model/project-actions';

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
  getProjectSummary: onSuccess => {
    dispatch(getProjectSummary(onSuccess));
  },
  getProject: (name, onSuccess) => {
    dispatch(getProject(name, onSuccess));
  },
  installProject: (catalogURL, name, onSuccess, onFailure) => {
    dispatch(installProject(catalogURL, name, onSuccess, onFailure));
  },
  updateProject: (projectURL, onSuccess, onFailure) => {
    dispatch(updateProject(projectURL, onSuccess, onFailure));
  },
  removeProject: (projectURL, onSuccess, onFailure) => {
    dispatch(removeProject(projectURL, onSuccess, onFailure));
  },
});

const BoundProjectActivity = connect(mapStateToProps, mapDispatchToProps)(ProjectActivity);

export default BoundProjectActivity;
