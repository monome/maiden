import React from 'react';

import TextButton from './text-button';
import ProjectInfo from './project-info';
import ProjectControl from './project-control';
import ProjectFilter, { projectMatchesFilter, collectTags } from './project-filter';

import './project-list.css';

const ProjectList = props => {
  const { projects, updateAllAction, updateAction, removeAction, filterProps } = props;
  let entries;
  const projectList = projects.get('projects')
    ? projects
        .get('projects')
        .map(e => ({ url: e.get('url'), name: e.get('project_name') }))
        .toArray()
    : [];

  // layer project data over catalog entry (if it exists)
  const composedProjects = projects.has('projects')
    ? projects
        .get('projects')
        .map(p => {
          const entry = p.getIn(['meta_data', 'catalog_entry']);
          return entry ? entry.merge(p) : p;
        })
        .toArray()
    : [];
  const matchingProjects = composedProjects.filter(p =>
    projectMatchesFilter(p, filterProps.filter),
  );

  if (projects.has('projects')) {
    entries = matchingProjects.map(composed => {
      const url = composed.get('url');
      const name = composed.get('project_name');
      return (
        <li key={url}>
          <ProjectControl>
            <ProjectInfo
              project={composed}
              selectedTags={filterProps.filter.tags}
              tagAction={filterProps.toggleTag}
            />
            <TextButton color="hsl(0, 0%, 45%)" action={() => updateAction(url, name)}>
              update
            </TextButton>
            <TextButton color="hsl(0, 0%, 45%)" action={() => removeAction(url, name)}>
              remove
            </TextButton>
          </ProjectControl>
        </li>
      );
    });
  }

  return (
    <div className="project-list-container">
      {projectList.length ? (
        <TextButton
          classes="project-update-all-button"
          color="hsl(0, 0%, 45%)"
          action={() => updateAllAction(projectList)}
        >
          update all
        </TextButton>
      ) : (
        ''
      )}
      {composedProjects.length ? (
        <ProjectFilter
          {...filterProps}
          tags={collectTags(composedProjects)}
          matchCount={matchingProjects.length}
          totalCount={composedProjects.length}
        />
      ) : (
        ''
      )}
      <ul className="project-listing">{entries}</ul>
    </div>
  );
};

export default ProjectList;
