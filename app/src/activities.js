import BoundEditActivity from './bound-edit-activity';
import BoundConfigureActivity from './bound-configure-activity';
import { EditorIcon, ReplIcon } from './icons';
import { SIDEBAR_COMPONENT, REPL_COMPONENT } from './constants';
import OS from './utils';

const activities = [
  {
    selector: 'editor',
    tooltipMessage: `toggle file viewer (${OS.metaKey()}B)`,
    tooltipPosition: 'right',
    icon: EditorIcon,
    toggle: SIDEBAR_COMPONENT,
    view: BoundEditActivity,
    position: 'upper',
  },
  {
    selector: 'editor',
    tooltipMessage: `toggle repl (${OS.metaKey()}E)`,
    tooltipPosition: 'right',
    icon: ReplIcon,
    toggle: REPL_COMPONENT,
    view: BoundEditActivity,
    position: 'upper',
  },
  {
    selector: 'configure',
    tooltipMessage: `configure (${OS.metaKey()};)`,
    tooltipPosition: 'right',
    icon: ReplIcon,
    view: BoundConfigureActivity,
    position: 'lower',
  },
];

export default activities;
