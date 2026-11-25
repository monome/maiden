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
let menuChromeInstalled = false;

/**
 * Monaco renders the editor context menu inside an open shadow root
 * (`.shadow-root-host`) with `:host { font-family: -apple-system… }`.
 * Document CSS cannot override that; inject matching maiden chrome into each
 * shadow root as it appears.
 */
const SHADOW_MENU_CHROME = `
:host {
  font-family: monospace !important;
}
.monaco-menu,
.monaco-menu .action-menu-item,
.monaco-menu .action-label,
.monaco-menu .keybinding {
  font-family: monospace !important;
}
.monaco-menu {
  border: 1px solid var(--neutral-trim-default) !important;
  border-radius: 4px !important;
  box-shadow: none !important;
}
`;

function applyShadowMenuChrome(host) {
  if (!host || !host.shadowRoot || host.dataset.maidenMenuChrome === '1') {
    return;
  }
  host.dataset.maidenMenuChrome = '1';
  const style = document.createElement('style');
  style.setAttribute('data-maiden-menu-chrome', '1');
  style.textContent = SHADOW_MENU_CHROME;
  host.shadowRoot.appendChild(style);
}

function installShadowMenuChrome() {
  if (menuChromeInstalled || typeof MutationObserver === 'undefined') {
    return;
  }
  menuChromeInstalled = true;

  const scan = root => {
    if (!root || !root.querySelectorAll) {
      return;
    }
    root.querySelectorAll('.shadow-root-host').forEach(applyShadowMenuChrome);
  };

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        if (node.classList && node.classList.contains('shadow-root-host')) {
          applyShadowMenuChrome(node);
        }
        scan(node);
      });
    }
  });

  const start = () => {
    scan(document);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
}

export function ensureMonaco() {
  if (initialized) {
    return monaco;
  }
  defineMaidenThemes(monaco);
  registerNornsSnippetProvider(monaco);
  installShadowMenuChrome();
  initialized = true;
  return monaco;
}

export { monaco };
