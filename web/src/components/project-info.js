import React from 'react';
import Badge from './badge';

import './project-info.css';

const ProjectInfo = (props) => {
  // NOTE: props.project is an immutablejs map
  const name = props.project.get('project_name');
  const description = props.project.get('description');
  const tags = props.project.get('tags');
  const project_version = props.project.get('version');
  const project_url = props.project.get('project_url');

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

  let version = undefined
  if (project_url) {
    version = <a href={project_url}
                className='project-info-version'
                target="_blank"
                rel="noopener noreferrer"
              >
                {project_version}
              </a>
  } else {
    version = <span className='project-info-version'>
                {project_version}
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
      {version}
      </div>
    </div>
  );
};

export default ProjectInfo;
