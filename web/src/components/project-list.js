import React from 'react';

import TextButton from './text-button';
import ProjectInfo from './project-info';
import ProjectControl from './project-control';

import './project-list.css';

const ProjectList = props => {
  const { projects, updateAction, removeAction } = props;
  let entries = undefined;
  if (projects && projects.has('projects')) {
    entries = projects.get('projects').map(p => {
      const url= p.get('url');
      return (
        <li key={url}>
          <ProjectControl>
            <ProjectInfo project={p} />
            <TextButton
              color='hsl(0, 0%, 59%)' 
              action={() => updateAction(url)}
            >
              update
            </TextButton>
            <TextButton
              color='hsl(0, 0%, 59%)' 
              action={() => removeAction(url)}
            >
              remove
            </TextButton>
          </ProjectControl>
        </li>
      );
    });
  }

  return (
    <div className='project-list-container'>
      <ul className='project-listing'>
        {entries}
      </ul>
    </div>
  );
};

export default ProjectList;
