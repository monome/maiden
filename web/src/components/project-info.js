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
  
  let title = undefined;
  const discussion = props.project.get('discussion_url');
  if (discussion) {
    title = <a href={discussion}
              className='project-info-name-link'
              target="_blank"
              rel="noopener noreferrer"
            >
              {name}
            </a>;
  } else {
    title = <span className='project-info-name'>
            {name}
           </span>
  }

  return (
    <div className='project-info'>
      <div className='project-info-top'>
        {title}
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
