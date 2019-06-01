import React, { Component } from 'react';
import cx from 'classname';

// TEMP: break out and bind
const ProjectView = props => {
  return <div>installed</div>;
}

// TEMP: break out and bind
const CatalogView = props => {
  return <div>available</div>
}

const ProjectSwitcherTab = props => {
  const className = cx(
    'project-switcher-tab',
    { noselect: true },
    { 'project-active-tab': props.isActive },
  );

  // TODO: add tooltip(s)
  return (
    <button 
      className={className}
      key={props.name}
      onClick={props.onClick}
    >
      {props.name}
    </button>
  );
};

const ProjectViewSwitcher = props => {
  const { selectedView, height, width } = props;

  const switcherSize = {
    width,
    height: 30,
  };

  const contentSize = {
    width,
    height: height - switcherSize.height,
  };

  const tabs = [
    <ProjectSwitcherTab
      name='installed' 
      isActive={selectedView === 'project'}
      onClick={() => props.projectViewSelect('project')} />,
    <ProjectSwitcherTab
      name='available'
      isActive={selectedView === 'catalog'}
      onClick={() => props.projectViewSelect('catalog')} />,
  ];

  return (
    <div>
      <div className="project-view-tabs" style={switcherSize}>
        {tabs}
      </div>
      <div className="project-something" style={contentSize}>
        foo
      </div>
    </div>
  )
}

class ProjectActivity extends Component {
  componentDidMount() {
    this.props.getCatalogSummary(summary => {
      // summary.get('catalogs').map(description => this.props.getCatalog(description.get('name')));
      console.log(summary.get('catalogs'));
      summary.get('catalogs').forEach(detail => {
        const name = detail.get('name');
        this.props.getCatalog(name);
      });
    });
    this.props.getProjectSummary();
  }

  render() {
    let child = <ProjectView />;
    if (this.props.activeComponent === 'catalog') {
      child = <CatalogView />;
    }
    return (
      <ProjectViewSwitcher
        selectedView={this.props.activeComponent}
        projectViewSelect={this.props.projectViewSelect}
      >
        {child}
      </ProjectViewSwitcher>
    );
  }
}

export default ProjectActivity;
