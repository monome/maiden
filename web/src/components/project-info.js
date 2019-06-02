import React from 'react';
import Badge from './badge';

import './project-info.css';

const ProjectInfo = (props) => {
  const {name, description, version, tags} = props.project;
  
  let badges = undefined;
  if (tags) {
    badges = tags.map(t => <Badge>{t}</Badge>)
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
