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
          "project_name": "ack",
          "url": "/api/v1/project/ack",
          "version": "24dcc12"
      },
      {
          "managed": true,
          "project_name": "glut",
          "url": "/api/v1/project/glut",
          "version": "9f3647a"
      },
      {
          "managed": true,
          "project_name": "meso",
          "url": "/api/v1/project/meso",
          "version": "7034c18"
      },
      {
          "managed": true,
          "project_name": "mlr",
          "url": "/api/v1/project/mlr",
          "version": "69d9ab6"
      },
      {
          "managed": true,
          "project_name": "molly_the_poly",
          "url": "/api/v1/project/molly_the_poly",
          "version": "604c1ee"
      },
      {
          "managed": true,
          "project_name": "orca",
          "url": "/api/v1/project/orca",
          "version": "28ae108"
      },
  ],
  "url": "/api/v1/projects"
});

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
