import React, { Component } from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { fromJS, Map } from 'immutable';

import Catalog from '../src/components/catalog';
import CatalogList from '../src/components/catalog-list';

const mockLinesCatalog = fromJS({
  "entries": [
      {
          "author": "Lee Azzarello (lazzarello)",
          "description": "foo bar baz",
          "origin": "lines",
          "project_name": "fm7",
          "project_url": "https://github.com/lazzarello/fm7",
          "tags": [
            "one",
          ],
      },
      {
          "author": "mark john williamson (junklight)",
          "description": "",
          "origin": "lines",
          "project_name": "kria_midi",
          "project_url": "https://github.com/junklight/misc"
      },
      {
          "author": "jai lai bookie (Dan_Derks)",
          "description": "",
          "origin": "lines",
          "project_name": "less_concepts",
          "project_url": "https://github.com/dndrks/less-concepts-norns"
      },
      {
          "author": "its your bedtime (its_your_bedtime)",
          "description": "",
          "origin": "lines",
          "project_name": "orca",
          "project_url": "https://github.com/hundredrabbits/Orca#operators"
      },
  ],
  "name": "lines",
  "updated": "0001-01-01T00:00:00Z",
  "url": "/api/v1/catalog/lines",
});

const mockCatalogs = Map({
  "one": mockLinesCatalog,
  "two": mockLinesCatalog,
});

const mockCatalogSummary = fromJS([
  {
    "name": "one",
  },
  {
    "name": "two",
  }
]);

storiesOf('Catalog', module)
  .add('single catalog', () => (
    <Catalog catalog={mockLinesCatalog}
      installAction={(url, name) => {
        action('do install', url, name);
      }}
    />
  ))
  .add('multiple catalogs', () => (
    <CatalogList catalogs={mockCatalogs}
      catalogSummary={mockCatalogSummary}
      installAction={(url, name) => {
        action('do install', url, name);
      }}
    />
  ));