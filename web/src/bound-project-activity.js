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
  getCatalogSummary: cb => {
    dispatch(getCatalogSummary(cb));
  },
  getCatalog: (name, cb) => {
    dispatch(getCatalog(name, cb));
  },
  getProjectSummary: cb => {
    dispatch(getProjectSummary(cb));
  },
  getProject: (name, cb) => {
    dispatch(getProject(name, cb));
  },
  installProject: (catalogURL, name, cb) => {
    dispatch(installProject(catalogURL, name, cb));
  },
  updateProject: (projectURL, cb) => {
    dispatch(updateProject(projectURL, cb));
  },
  removeProject: (projectURL, cb) => {
    dispatch(removeProject(projectURL, cb));
  },
});

const BoundProjectActivity = connect(mapStateToProps, mapDispatchToProps)(ProjectActivity);

export default BoundProjectActivity;
