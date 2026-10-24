import React from 'react';
import Catalog from './catalog';
import './catalog-list.css';
import TextButton from './text-button';
import ProjectFilter, { isFilterActive, projectMatchesFilter, collectTags } from './project-filter';

const CatalogList = props => {
  const { filterProps } = props;
  const { filter } = filterProps;

  let allEntries = [];
  let matchCount = 0;

  const catalogs = props.catalogSummary
    .valueSeq()
    .map(c => {
      const name = c.get('name');
      const catalog = props.catalogs.get(name);
      if (!catalog) {
        return null;
      }
      const entries = catalog.get('entries');
      const matchingEntries = entries.filter(e => projectMatchesFilter(e, filter));
      allEntries = allEntries.concat(entries.toArray());
      matchCount += matchingEntries.size;

      // hide catalogs without any matches while filtering
      if (isFilterActive(filter) && matchingEntries.size === 0) {
        return null;
      }
      return (
        <li key={name}>
          <Catalog
            catalog={catalog}
            entries={matchingEntries}
            installedProjects={props.installedProjects}
            installAction={props.installAction}
            refreshAction={props.refreshAction}
            selectedTags={filter.tags}
            tagAction={filterProps.toggleTag}
          />
        </li>
      );
    })
    .toArray()
    .filter(c => c);

  return (
    <div className="catalog-list-container">
      {props.catalogSummary.size ? (
        <TextButton
          classes="catalog-refresh-all-button"
          color="hsl(0, 0%, 45%)"
          action={() => props.refreshAllAction(props.catalogSummary)}
        >
          refresh all
        </TextButton>
      ) : (
        ''
      )}
      {allEntries.length ? (
        <ProjectFilter
          {...filterProps}
          tags={collectTags(allEntries)}
          matchCount={matchCount}
          totalCount={allEntries.length}
        />
      ) : (
        ''
      )}
      <ul className="catalog-list">{catalogs}</ul>
    </div>
  );
};

export default CatalogList;
