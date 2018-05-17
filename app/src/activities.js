import BoundEditActivity from './bound-edit-activity';
import BoundConfigureActivity from './bound-configure-activity';
import { ICONS } from './svg-icons';
import { SIDEBAR_COMPONENT, REPL_COMPONENT } from './constants';
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
    selector: 'configure',
    tooltipMessage: `configure (${OS.metaKey()};)`,
    tooltipPosition: 'right',
    icon: ICONS.cog,
    view: BoundConfigureActivity,
    position: 'lower',
  },
];

export default activities;
