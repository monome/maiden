import React from 'react';

import './project-control.css';

const ProjectControl = props => {
  const summary = props.children[0];
  const controls = props.children.slice(1);

  return (
    <div className="project-control">
      <div className="project-summary-container">{summary}</div>
      <div className="project-control-container">{controls}</div>
    </div>
  );
};

export default ProjectControl;
