import React, { Component } from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Switcher from '../src/components/switcher';

let activeTab = 'installed';

//
// NOTE: the Switcher component expects each child component to have a 'name'
// property which becomes the name of the tab
//

storiesOf('Switcher', module)
  .add('text badges', () => (
    <div style={{'width': '100%', 'height': '100%'}}>
      <Switcher
        select={t => { activeTab = t }}
        activeTab={activeTab}
      >
        <div name='installed' key='one'>installed</div>
        <div name='available' key='two'>available</div>
      </Switcher>
    </div>
  ));

