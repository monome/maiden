import React from 'react';
import BoundEditActivity from './bound-edit-activity';
import ReplView from './repl-view';
import { ICONS } from './svg-icons';

/*
const definitions = [
    {
        selector: 'editor',
        icon: ICONS.pencil,
        view: BoundEditActivity,
    }
];
*/


export class Activity {
    constructor(name, icon) {
        this.selector = name;
        this.icon = icon;
    }

    getSelector = () => { 
        return this.selector;
    }

    getIcon = () => {
        return this.icon;
    }

    getView = () => {
        return <span>activity</span>
    }
}

export class EditActivity extends Activity {
    constructor() {
        // super("editor", ICONS.pencil);
        super("editor", ICONS['file-text2']);
    }

    getView = () => {
        return BoundEditActivity;
    }

}

export class ReplActivity extends Activity {
    constructor() {
        super("repl", ICONS.terminal);
    }

    getView = () => {
        return ReplView;
    }
}