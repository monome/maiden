import React from 'react';
import ScriptEditor from './script-editor';
import ReplView from './repl-view';
import { ICONS } from './svg-icons';

/*
const definitions = [
    {
        selector: 'editor',
        icon: ICONS.pencil,
        view: ScriptEditor,
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
        return ScriptEditor;
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