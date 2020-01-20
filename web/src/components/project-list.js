import React from 'react';

import TextButton from './text-button';
import ProjectInfo from './project-info';
import ProjectControl from './project-control';

import './project-list.css';

const ProjectList = props => {
  const { projects, updateAllAction, updateAction, removeAction } = props;
  let entries = undefined;
  const projectList = projects.get('projects') ? projects.get('projects').map(e => ({url: e.get('url'), name: e.get('project_name')})).toArray() : [];
  if (projects && projects.has('projects')) {
    entries = projects.get('projects').map(p => {
      // layer project data over catalog entry (if it exists)
      let composed = p;
      const entry = p.getIn(['meta_data', 'catalog_entry'])
      if (entry) {
        composed = entry.merge(p);
      }
      const url = composed.get('url');
      const name = composed.get('project_name')
      return (
        <li key={url}>
          <ProjectControl>
            <ProjectInfo project={composed} />
            <TextButton
              color='hsl(0, 0%, 45%)'
              action={() => updateAction(url, name)}
            >
              update
            </TextButton>
            <TextButton
              color='hsl(0, 0%, 45%)'
              action={() => removeAction(url, name)}
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
      {projectList.length ? (<TextButton
        classes='project-update-all-button'
        color='hsl(0, 0%, 45%)'
        action={() => updateAllAction(projectList)}
      >update all</TextButton>) : ''}
      <ul className='project-listing'>
        {entries}
      </ul>
    </div>
  );
};

export default ProjectList;
