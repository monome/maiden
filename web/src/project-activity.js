import React, { Component } from 'react';

import Switcher from './components/switcher';
import CatalogList from './components/catalog-list';
import ProjectList from './components/project-list';

import './project-activity.css';

class ProjectActivity extends Component {
  componentDidMount() {
    this.props.getCatalogSummary(summary => {
      summary.get('catalogs').forEach(detail => {
       const url = detail.get('url');
       this.props.getCatalogByURL(url);
      });
    });
    this.props.getProjectSummary();
  };

  handleTabSelection = name => {
    this.props.projectViewSelect(name);
  };

  handleRefreshAction = url => {
    console.log('refreshing catalog', url);
    this.props.updateCatalog(url);
  };

  handleInstallAction = (url, name) => {
    console.log('doing install', url, name);
    this.props.installProject(url, name,
      _ => {
        // refresh project list
        this.props.getProjectSummary();
        this.props.refreshCodeDir();
      },
      failure => {
        console.log('install-project failed', failure);
      });
  };

  handleUpdateAction = url => {
    console.log('doing update', url);
    this.props.updateProject(url, 
      _ => {
        this.props.getProjectSummary();
        this.props.refreshCodeDir();
      },
      failure => {
        console.log('update-project failed', failure);
      });
  };

  handleRemoveAction = url => {
    console.log('doing remove', url);
    this.props.removeProject(url,
      _ => {
        // refresh project list
        this.props.getProjectSummary();
        this.props.refreshCodeDir();
      },
      failure => {
        console.log('update-project failed', failure);
      });
  };

  render() {
    const switcherSize = {
      height: this.props.height - 10,  // FIXME: not sure why this is longer than it should be
      width: this.props.width,
    };

    return (
      <div className='project-activity-container'>
        <Switcher
          size={switcherSize}
          select={this.handleTabSelection}
          activeTab={this.props.activeComponent}
        >
          <ProjectList
            name='installed'
            projects={this.props.projectSummary}
            updateAction={this.handleUpdateAction}
            removeAction={this.handleRemoveAction}
          />
          <CatalogList
            name='available'
            catalogSummary={this.props.catalogSummary}
            catalogs={this.props.catalogs}
            installAction={this.handleInstallAction}
            refreshAction={this.handleRefreshAction}
          />
         </Switcher>
      </div>
    );
  };

}

export default ProjectActivity;
