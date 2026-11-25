import OS from './utils';

class CommandService {
  constructor() {
    this.commands = new Map();
  }
  registerCommand(name, cmd) {
    this.commands.set(name, cmd);
  }
}

export const commandService = new CommandService();

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

  get vimKey() {
    return `<C-${this.key}>`;
  }

  osModKey(os) {
    return `${Modifier[os][this.modifier].name}-${this.key}`;
  }

  matches(event) {
    if (!this.osModifier.matches(event)) {
      return false;
    }
    // KeyboardEvent.key is 'Enter'; Ace bindings historically used 'enter'.
    return event.key.toLowerCase() === this.key.toLowerCase();
  }
}

class KeyBinding {
  constructor(keystroke, commandId) {
    this.keystroke = keystroke;
    this.commandId = commandId;
  }
}

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
  new KeyBinding(new KeyStroke(Modifier.CMD, 'enter'), 'eval'),
];

/** Persisted editor.json values for vim/emacs (kept for existing configs). */
export const KEYBOARD_VIM = 'ace/keyboard/vim';
export const KEYBOARD_EMACS = 'ace/keyboard/emacs';

export function keyboardModeFromHandler(keyBoardHandler) {
  if (keyBoardHandler === KEYBOARD_VIM) {
    return 'vim';
  }
  if (keyBoardHandler === KEYBOARD_EMACS) {
    return 'emacs';
  }
  return 'default';
}

const EXTENSION_LANGUAGE = {
  lua: 'lua',
  md: 'markdown',
  markdown: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  sh: 'shell',
  bash: 'shell',
};

export function languageIdForFileName(fileName) {
  if (!fileName) {
    return 'plaintext';
  }
  const match = fileName.toLowerCase().match(/\.([^.\\/]+)$/);
  if (!match) {
    return 'plaintext';
  }
  return EXTENSION_LANGUAGE[match[1]] || 'plaintext';
}

class EditorService {
  getLanguageId(fileName) {
    return languageIdForFileName(fileName);
  }
}

export const editorService = new EditorService();
