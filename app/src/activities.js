import BoundEditActivity from './bound-edit-activity';
import ReplActivity from './repl-activity';
import { ICONS } from './svg-icons';

const activities = [
    {
        selector: 'editor',
        icon: ICONS['file-text2'],
        view: BoundEditActivity,
    },
    {
        selector: 'repl',
        icon: ICONS['terminal'],
        view: ReplActivity,
    }
];

export default activities;