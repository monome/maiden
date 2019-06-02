import React from 'react';
import Badge from './badge';

import './project-info.css';

const ProjectInfo = (props) => {
  // NOTE: props.project is an immutablejs map
  const name = props.project.get('project_name');
  const description = props.project.get('description');
  const version = props.project.get('version');
  const tags = props.project.get('tags');
  
  let badges = undefined;
  if (tags) {
    badges = tags.map(t => <Badge key={t}>{t}</Badge>)
  }

  return (
    <div className='project-info'>
      <div className='project-info-top'>
        <span className='project-info-name'>
          {name}
        </span>
        <span className='project-badges'>
          {badges}
        </span>
      </div>
      <div className='project-info-bottom'>
        <span className='project-info-description'>
          {description}
        </span>
        <span className='project-info-version'>
          {version}
        </span>
      </div>
    </div>
  );
};

export default ProjectInfo;
