import OS from './utils';
import EditorMode from './mode';
import LuaMode from './mode/lua';

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
  new KeyBinding(new KeyStroke(Modifier.CMD, '8'), 'eval'),
];

class TextMode extends EditorMode {
  constructor() {
    super('text');
    // https://github.com/monome/maiden/issues/129
    this.enableSnippets = false;
  }
}

class JsonMode extends EditorMode {
  constructor() {
    super('json');
    this.enableSnippets = false;
  }
}

class EditorService {
  constructor() {
    this.luaMode = new LuaMode();
    this.textMode = new TextMode();
    this.jsonMode = new JsonMode();
  }
  getMode(fileName) {
    if (fileName) {
      if (fileName.endsWith('.lua')) {
        return this.luaMode;
      }
      else if(fileName.endsWith('.json')) {
        return this.jsonMode;
      }
    }
    // fall back to a simple text mode for non-lua files.
    return this.textMode;
  }
}

export const editorService = new EditorService();
