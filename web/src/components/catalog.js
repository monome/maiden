import React from 'react';

import TextButton from './text-button';
import ProjectInfo from './project-info';
import ProjectControl from './project-control';

import './catalog.css';

const Catalog = (props) => {
  const {catalog} = props;
  const catalogURL = catalog.get('url');

  const entries = catalog.get('entries').map(e => {
    const projectName = e.get('project_name');
    const projectURL = e.get('project_url');
    const key = `${projectName}-${projectURL || ""}`; // to silence warnings
    return (
      <li key={key}>
      <ProjectControl>
        <ProjectInfo project={e} />
        <TextButton color="hsl(0, 0%, 59%)"
          action={() => props.installAction(catalogURL, projectName)}
        >
          install  
        </TextButton>
      </ProjectControl>
      </li>
    );
  });

  return (
    <div className='catalog-container'>
      <div className='catalog-name'>
        {catalog.get('name')}
      </div>
      <ul className='catalog-entries'>
        {entries}
      </ul>
    </div>
  );
}

export default Catalog;