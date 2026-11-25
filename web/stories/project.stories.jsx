import React from 'react';

import { fromJS } from 'immutable';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Badge from '../src/components/badge';
import TextButton from '../src/components/text-button';
import ProjectInfo from '../src/components/project-info';
import ProjectControl from '../src/components/project-control';
import ProjectList from '../src/components/project-list';

const mockProject = fromJS({
  'project_name': 'meso',
  'description': 'abstractions to build on',
  'tags': [
    'midi',
    'grid',
    'lib'
  ],
  'version': "1.3.2",
});

const mockProjectSummary = fromJS({
  "projects": [
      {
          "managed": true,
          "meta_data": {
              "catalog_entry": {
                  "author": "Brian Crabtree (tehn)",
                  "description": "",
                  "discussion_url": "https://llllllll.co/t/21022",
                  "origin": "lines",
                  "project_name": "awake",
                  "project_url": "https://github.com/tehn/awake"
              },
              "file_info": {
                  "kind": "project_metadata",
                  "version": 1
              },
              "installed_on": "2019-07-05T20:57:44.408481-07:00",
              "project_url": "https://github.com/tehn/awake",
              "updated_on": "0001-01-01T00:00:00Z"
          },
          "project_name": "awake",
          "url": "/api/v1/project/awake",
          "version": "0d5e4ba"
      },
      {
          "managed": true,
          "meta_data": {
              "catalog_entry": {
                  "author": "Matthew (Justmat)",
                  "description": "",
                  "discussion_url": "https://llllllll.co/t/23336",
                  "origin": "lines",
                  "project_name": "bounds",
                  "project_url": "https://github.com/notjustmat/bounds"
              },
              "file_info": {
                  "kind": "project_metadata",
                  "version": 1
              },
              "installed_on": "2019-07-05T20:57:46.211228-07:00",
              "project_url": "https://github.com/notjustmat/bounds",
              "updated_on": "0001-01-01T00:00:00Z"
          },
          "project_name": "bounds",
          "url": "/api/v1/project/bounds",
          "version": "de6ea8c"
      },
      {
          "managed": true,
          "meta_data": {
              "catalog_entry": {
                  "description": "abstractions to build on",
                  "project_name": "meso-git",
                  "project_url": "https://github.com/ngwese/meso.git",
                  "tags": [
                      "powermate",
                      "hid",
                      "lib"
                  ]
              },
              "file_info": {
                  "kind": "project_metadata",
                  "version": 1
              },
              "installed_on": "2019-07-05T20:48:47.683785-07:00",
              "project_url": "https://github.com/ngwese/meso.git",
              "updated_on": "2019-07-05T20:49:22.792449-07:00"
          },
          "project_name": "meso-git",
          "url": "/api/v1/project/meso-git",
          "version": "29956ad"
      }
  ],
  "url": "/api/v1/projects"
}
);

storiesOf('Projects', module)
  .add('text badges', () => (
    <span>
      <Badge>midi</Badge>
      <Badge>arc</Badge>
      <Badge>grid</Badge>
    </span>
  ))
  .add('text button', () => (
    <div>
      <TextButton color="hsl(0, 0%, 59%)" action={action('install')}>
        install
      </TextButton>
      <TextButton color="hsl(0, 0%, 59%)" action={action('disabled')}disabled={true}>
        disabled
      </TextButton>
    </div>
  ))
  .add('info', () => (
    <div style={{'width': 400}}>
      <ProjectInfo project={mockProject} />    
    </div>
  ))
  .add('install project entry', () => (
    <ProjectControl>
      <ProjectInfo project={mockProject} />
      <TextButton color="hsl(0, 0%, 59%)" action={action('install')}>install</TextButton>
      <TextButton color="hsl(0, 0%, 59%)" action={action('remove')}>remove</TextButton>
    </ProjectControl>
  ))
  .add('project summary / listing', () => (
    <ProjectList projects={mockProjectSummary} />
  ));
