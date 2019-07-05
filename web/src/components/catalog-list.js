import React from 'react';
import Catalog from './catalog';
import './catalog-list.css';

const CatalogList = props => {
  const catalogs = props.catalogSummary.valueSeq().map(c => {
    const name = c.get('name');
    const catalog = props.catalogs.get(name);
    return (
      <li key={name}>
        <Catalog catalog={catalog} installAction={props.installAction} refreshAction={props.refreshAction} />
      </li>
    );
  });
  return (
    <ul className='catalog-list'>
      {catalogs}
    </ul>
  );
};

export default CatalogList;