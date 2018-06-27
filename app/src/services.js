import OS from './utils';
import { nornsSnippetCompleter } from './snippets';
import NornsLuaMode from './mode/lua';

const includes = require('array-includes');

const Modifier = {
  CMD: 1,
  win: {
    1: {
      name: 'Ctrl',
      label: 'ctrl+',
      matches: e => e.ctrlKey,
    },
  },
  mac: {
    1: {
      name: 'Command',
      label: '⌘',
      matches: e => e.metaKey,
    },
  },
};

class KeyStroke {
  constructor(modifier, key) {
    this.modifier = modifier;
    this.key = key;
  }

  get win() {
    return Modifier.win[this.modifier];
  }

  get mac() {
    return Modifier.mac[this.modifier];
  }

  get osModifier() {
    return OS.isMac ? this.mac : this.win;
  }

  matches(event) {
    if (!this.osModifier.matches(event)) {
      return false;
    }
    return event.key === this.key;
  }
}

class KeyBinding {
  constructor(keystroke, commandId) {
    this.keystroke = keystroke;
    this.commandId = commandId;
  }
}

class CommandService {
  constructor() {
    this.commands = new Map();
  }
  registerCommand(name, cmd) {
    this.commands.set(name, cmd);
  }
}

export const commandService = new CommandService();

class KeyService {
  constructor() {
    this.bindings = [];
  }

  handleKey(event) {
    // parse and dispatch
    const cmd = this.findCommand(event);
    if (cmd != null) {
      cmd();
      // cancels.
      return false;
    }
    return true;
  }

  findCommand(event) {
    const binding = this.bindings.find(b => b.keystroke.matches(event));
    if (binding != null) {
      const id = binding.commandId;
      return commandService.commands.get(id);
    }
    return null;
  }
}

export const keyService = new KeyService();

keyService.bindings = [
  // TODO (pq): consider an enum (or consts) for command names
  new KeyBinding(new KeyStroke(Modifier.CMD, 'p'), 'play'),
  new KeyBinding(new KeyStroke(Modifier.CMD, 's'), 'save'),
  new KeyBinding(new KeyStroke(Modifier.CMD, 'e'), 'toggle repl'),
  new KeyBinding(new KeyStroke(Modifier.CMD, 'b'), 'toggle sidebar'),
  new KeyBinding(new KeyStroke(Modifier.CMD, ';'), 'show config'),
];

export class EditorMode {
  constructor(id) {
    this.id = id;
  }

  /* eslint-disable-next-line no-unused-vars */
  onRender(editor) {
    // no-op; optionally overridden in subclasses.
  }
}

class LuaMode extends EditorMode {
  constructor() {
    super('lua');
    this.nornsLuaAceMode = new NornsLuaMode();
  }
  onRender(editor) {
    // ensure our contributions are registered.
    const session = editor.getSession();
    if (session.getMode() !== this.nornsLuaAceMode) {
      session.setMode(this.nornsLuaAceMode);
    }

    const completers = editor.completers;
    if (!includes(completers, nornsSnippetCompleter)) {
      completers.push(nornsSnippetCompleter);
    }
  }
}

class TextMode extends EditorMode {
  constructor() {
    super('text');
  }
}

class EditorService {
  constructor() {
    this.luaMode = new LuaMode();
    this.textMode = new TextMode();
  }
  getMode(fileName) {
    // fall back to a simple text mode for non-lua files.
    return fileName && fileName.endsWith('.lua') ? this.luaMode : this.textMode;
  }
}

export const editorService = new EditorService();
