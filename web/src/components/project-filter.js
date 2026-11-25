import React from 'react';
import cx from 'classname';

import './project-filter.css';

// NOTE: project is an immutablejs map, filter is { query: string, tags: immutablejs Set }
export const isFilterActive = filter => filter.query.trim() !== '' || filter.tags.size > 0;

export const projectMatchesFilter = (project, filter) => {
  const tags = project.get('tags') || [];

  // every selected tag must be present on the project
  if (!filter.tags.every(t => tags.includes(t))) {
    return false;
  }

  // every word of the query must appear in the name, author, description or tags
  const words = filter.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w);
  if (words.length === 0) {
    return true;
  }
  const haystack = [
    project.get('project_name'),
    project.get('author'),
    project.get('description'),
    ...tags,
  ]
    .filter(s => s)
    .join(' ')
    .toLowerCase();
  return words.every(w => haystack.includes(w));
};

// returns a sorted array of [tag, count] for the given projects
export const collectTags = projects => {
  const counts = {};
  projects.forEach(p => {
    (p.get('tags') || []).forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    });
  });
  return Object.keys(counts)
    .sort()
    .map(t => [t, counts[t]]);
};

const ProjectFilter = props => {
  const { filter, tags, matchCount, totalCount } = props;

  // keep selected tags visible even if the current list doesn't contain them
  const tagCounts = [...tags];
  filter.tags.forEach(t => {
    if (!tagCounts.find(([name]) => name === t)) {
      tagCounts.push([t, 0]);
    }
  });

  const chips = tagCounts.map(([t, count]) => (
    <button
      key={t}
      className={cx('project-filter-tag', { 'project-filter-tag-selected': filter.tags.has(t) })}
      onClick={() => props.toggleTag(t)}
    >
      {t}
      <span className="project-filter-tag-count">{count}</span>
    </button>
  ));

  return (
    <div className="project-filter">
      <div className="project-filter-search">
        <input
          className="project-filter-input"
          type="text"
          placeholder="search projects..."
          value={filter.query}
          onChange={e => props.setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              props.clear();
            }
          }}
          spellCheck={false}
        />
        <span className="project-filter-count">
          {isFilterActive(filter) ? `${matchCount} / ${totalCount}` : totalCount}
        </span>
        <button
          className="project-filter-clear"
          onClick={props.clear}
          disabled={!isFilterActive(filter)}
        >
          clear
        </button>
      </div>
      {chips.length ? <div className="project-filter-tags">{chips}</div> : ''}
    </div>
  );
};

export default ProjectFilter;
