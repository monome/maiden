import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/editor/editor.all';
import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution';
import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import 'monaco-editor/min/vs/editor/editor.main.css';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

import { defineMaidenThemes } from './theme/maiden-themes';
import { registerNornsSnippetProvider } from './snippets';

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === 'json') {
      return new JsonWorker();
    }
    return new EditorWorker();
  },
};

let initialized = false;

export function ensureMonaco() {
  if (initialized) {
    return monaco;
  }
  defineMaidenThemes(monaco);
  registerNornsSnippetProvider(monaco);
  initialized = true;
  return monaco;
}

export { monaco };
