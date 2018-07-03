import 'brace/mode/lua';
import 'brace/mode/text';

import EditorMode from '../mode';
import { nornsSnippetCompleter } from '../snippets';

const includes = require('array-includes');

const luaKeyWordsToFilter = [
  // lua version incompatibilities.
  //
  // 5.2 => 5.3: https://www.lua.org/manual/5.3/manual.html#8
  // deprecated:
  'atan2',
  'cosh',
  'sinh',
  'tanh',
  'pow',
  'frexp',
  'ldexp',
  // 5.1 => 5.2: http://www.lua.org/manual/5.2/manual.html#8
  // deprecated/removed:
  'module',
  'setfenv',
  'getfenv',
  'log10',
  'loadstring',
  'maxn',
  'loaders',
  // 5.0 => 5.1: https://www.lua.org/manual/5.1/manual.html#7
  // deprecated/removed:
  'gfind',
  'setn',
  'mod',
  'foreach',
  'foreachi',
  'gcinfo',
  // ???:
  'acequire',
];

const luaKeyWordsToAdd = [
  // 5.2: loaders => searchers
  'searchers',
];

class NornsLuaRules extends window.ace.acequire('ace/mode/lua_highlight_rules').LuaHighlightRules {
  constructor() {
    super();
    const filteredKeywords = this.$keywordList.filter(k => !includes(luaKeyWordsToFilter, k));
    this.$keywordList = filteredKeywords.concat(luaKeyWordsToAdd);
  }
}

class NornsLuaMode extends window.ace.acequire('ace/mode/lua').Mode {
  constructor() {
    super();
    this.HighlightRules = NornsLuaRules;
  }
}

export default class LuaMode extends EditorMode {
  constructor() {
    super('lua');
    this.nornsLuaAceMode = new NornsLuaMode();
  }
  onRender(editor) {
    if (!editor) return;
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
