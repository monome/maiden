import React from 'react';
import Catalog from './catalog';
import './catalog-list.css';

const CatalogList = props => {
  const catalogs = props.catalogs.valueSeq().map(c => (
    <li>
      <Catalog catalog={c} installAction={props.installAction} />
    </li>
  ));
  return (
    <ul className='catalog-list'>
      {catalogs}
    </ul>
  );
};

export default CatalogList;