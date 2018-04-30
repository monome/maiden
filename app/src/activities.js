import BoundEditActivity from './bound-edit-activity';
import ConfigureActivity from './configure-activity';
import { ICONS } from './svg-icons';
import { SIDEBAR_COMPONENT, REPL_COMPONENT } from './constants';

const activities = [
    {
        selector: 'editor',
        icon: ICONS['file-text2'],
        toggle: SIDEBAR_COMPONENT,
        view: BoundEditActivity,
        position: 'upper',
    },
    {
        selector: 'editor',
        icon: ICONS['terminal'],
        toggle: REPL_COMPONENT,
        view: BoundEditActivity,
        position: 'upper',
    },
    {
        selector: 'configure',
        icon: ICONS['cog'],
        view: ConfigureActivity,
        position: 'lower',
    }
];

export default activities;