import React, { Component } from 'react';

import Switcher from './components/switcher';
import CatalogList from './components/catalog-list';

import './project-activity.css';

class ProjectActivity extends Component {
  componentDidMount() {
    this.props.getCatalogSummary(summary => {
      // summary.get('catalogs').map(description => this.props.getCatalog(description.get('name')));
      //console.log(summary.get('catalogs'));
      summary.get('catalogs').forEach(detail => {
        const name = detail.get('name');
        this.props.getCatalog(name);
      });
    });
    this.props.getProjectSummary();
  };

  handleTabSelection = name => {
    //this.props.projectViewSelect(name);
  };

  handleInstallAction = (url, name) => {
    console.log('doing install', url, name);
  };

  render() {
    const switcherSize = {
      height: this.props.height,
      width: this.props.width,
    };

    return (
      <div className='project-activity-container'>
        <Switcher
          size={switcherSize}
          select={this.handleTabSelection}
          activeTab={this.props.activeComponent}
        >
          <div name='installed'>
            something
          </div>
          <CatalogList
            name='available'
            catalogs={this.props.catalogs}
            installAction={this.handleInstallAction}
          />
         </Switcher>
      </div>
    );
  };


  render2() {
    //console.log('PA this.props', this.props)
    const style = {
      height: this.props.height,
      width: this.props.width,
    };

    return (
      <div className='project-activity-container' style={style}>
        <CatalogList
          name="available"
          catalogs={this.props.catalogs}
          installAction={this.handleInstallAction}
        />
      </div>
    );
  };

}

export default ProjectActivity;
