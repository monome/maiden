import React from 'react';

import IconButton from '../icon-button';
import { ICONS } from '../svg-icons';

import TextButton from './text-button';
import ProjectInfo from './project-info';
import ProjectControl from './project-control';

import './catalog.css';

const Catalog = props => {
  const { catalog, installedProjects } = props;
  const catalogURL = catalog.get('url');

  const entries = catalog.get('entries').map(e => {
    const projectName = e.get('project_name');
    const projectURL = e.get('project_url');
    const key = `${projectName}-${projectURL || ''}`; // to silence warnings

    return (
      <li key={key}>
        <ProjectControl>
          <ProjectInfo project={e} />
          {(installedProjects || []).indexOf(projectName) === -1 ? (
            <TextButton action={() => props.installAction(catalogURL, projectName)}>
              install
            </TextButton>
          ) : (
            <div className="catalog-installed-label">installed</div>
          )}
        </ProjectControl>
      </li>
    );
  });

  return (
    <div className="catalog-container">
      <div className="catalog-name">
        {catalog.get('name')}
        <IconButton
          tooltipMessage="update catalog"
          tooltipPosition="right"
          icon={ICONS.loop2}
          size="12"
          padding="1"
          color="hsl(0, 0%, 45%)"
          dark
          action={() => props.refreshAction(catalogURL)}
        />
      </div>
      <ul className="catalog-entries">{entries}</ul>
    </div>
  );
};

export default Catalog;
