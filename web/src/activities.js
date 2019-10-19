import BoundEditActivity from './bound-edit-activity';
import BoundProjectActivity from './bound-project-activity';
import HelpButton from './help-button';
import { ICONS } from './svg-icons';
import {
  SIDEBAR_COMPONENT,
  REPL_COMPONENT,
  CONFIG_COMPONENT,
  PROJECT_COMPONENT,
} from './constants';
import OS from './utils';

const activities = [
  {
    selector: 'editor',
    tooltipMessage: `toggle file viewer (${OS.metaKey()}B)`,
    tooltipPosition: 'right',
    icon: ICONS['file-text2'],
    toggle: SIDEBAR_COMPONENT,
    view: BoundEditActivity,
    position: 'upper',
  },
  {
    selector: 'editor',
    tooltipMessage: `toggle repl (${OS.metaKey()}E)`,
    tooltipPosition: 'right',
    icon: ICONS.terminal,
    toggle: REPL_COMPONENT,
    view: BoundEditActivity,
    position: 'upper',
  },
  {
    selector: 'project', // ????
    icon: ICONS.books,
    toggle: PROJECT_COMPONENT,
    view: BoundProjectActivity,
    position: 'upper',
  },
  {
    component: HelpButton,
    key: 'help',
    position: 'lower',
  },
  {
    selector: 'editor',
    tooltipMessage: `toggle configuration (${OS.metaKey()};)`,
    tooltipPosition: 'right',
    icon: ICONS.cog,
    toggle: CONFIG_COMPONENT,
    view: BoundEditActivity,
    position: 'lower',
  },
];

export default activities;
