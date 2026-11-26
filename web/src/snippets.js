export const snippets = {
  cleanup: {
    code: '-- cleanup, release memory\nfunction cleanup()\n  ${0}\nend',
    doc: 'called on script quit, release memory',
  },
  init: {
    code: '--- init function\nfunction init()\n  ${0}\nend',
    doc: 'called on script init',
  },
  enc: {
    code: '--- enc function\nfunction enc(n, delta)\n  ${0}\nend',
    doc: 'called on encoder delta',
  },
  gridkey: {
    code: '--- grid key function\nfunction gridkey(x, y, state)\n  ${0}\nend',
    doc: 'called on grid key events',
  },
  key: {
    code: '--- key function\nfunction key(n, z)\n  ${0}\nend',
    doc: 'called on key press/release',
  },
  redraw: {
    code: '--- screen redraw function\nfunction redraw()\n  ${0}\nend',
    doc: 'called on screen redraw',
  },
  // TODO (pq): add midi, hid, ...
};

export function nornsSnippetCompletionItems(monaco, prefix = '') {
  return Object.keys(snippets)
    .filter(word => !prefix || word.startsWith(prefix))
    .map(word => ({
      label: word,
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail: 'norns',
      documentation: snippets[word].doc,
      insertText: snippets[word].code,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      sortText: `0_${word}`,
    }));
}

export function registerNornsSnippetProvider(monaco) {
  return monaco.languages.registerCompletionItemProvider('lua', {
    triggerCharacters: [],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const prefix = word.word || '';
      // Skip empty prefixes to avoid flooding suggestions (same as Ace completer).
      if (prefix.length === 0) {
        return { suggestions: [] };
      }
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: nornsSnippetCompletionItems(monaco, prefix).map(item => ({
          ...item,
          range,
        })),
      };
    },
  });
}
