import React from 'react';
import Catalog from './catalog';
import './catalog-list.css';
import TextButton from './text-button';

const CatalogList = props => {
  const catalogs = props.catalogSummary.valueSeq().map(c => {
    const name = c.get('name');
    const catalog = props.catalogs.get(name);
    return (
      <li key={name}>
        <Catalog catalog={catalog} installedProjects={props.installedProjects} installAction={props.installAction} refreshAction={props.refreshAction} />
      </li>
    );
  });
  return (
    <div className='catalog-list-container'>
      {catalogs.size ? (<TextButton
        classes='catalog-refresh-all-button'
        color='hsl(0, 0%, 45%)'
        action={() => props.refreshAllAction(props.catalogSummary)}
        >refresh all</TextButton>) : ''}
      <ul className='catalog-list'>
        {catalogs}
      </ul>
    </div>
  );
};

export default CatalogList;