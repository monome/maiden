import React from 'react';
import Badge from './badge';
import IconButton from '../icon-button';
import { ICONS } from '../svg-icons';

import './project-info.css';

const openLinkAction = (url) => {
  return () => {
    window.open(url, "_blank");
  }
};

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

  let documentation = undefined;
  const doc_url = props.project.get('documentation_url');
  if (doc_url) {
    documentation = <IconButton
      action={openLinkAction(doc_url)}
      tooltipMessage="open documentation"
      icon={ICONS.book}
      color="hsl(0, 0%, 59%)"
      size="16"
      padding="2px"
    />
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
          {documentation}
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
