// Dark tokens from the previous Ace "norns_dark" / Tomorrow Night theme.
// Light tokens follow Ace Dawn, with chrome colors from maiden CSS variables.

export function defineMaidenThemes(monaco) {
  monaco.editor.defineTheme('maiden-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '969896' },
      { token: 'string', foreground: 'B5BD68' },
      { token: 'keyword', foreground: 'B294BB' },
      { token: 'number', foreground: 'DE935F' },
      { token: 'regexp', foreground: 'CC6666' },
      { token: 'type', foreground: 'F0C674' },
      { token: 'class', foreground: 'F0C674' },
      { token: 'function', foreground: '81A2BE' },
      { token: 'variable', foreground: '81A2BE' },
      { token: 'constant', foreground: 'DE935F' },
      { token: 'tag', foreground: 'CC6666' },
      { token: 'metatag', foreground: 'CC6666' },
      { token: 'attribute.name', foreground: 'CC6666' },
      { token: 'delimiter', foreground: 'C5C8C6' },
      { token: 'operator', foreground: '8ABEB7' },
    ],
    colors: {
      'editor.background': '#1D1F21',
      'editor.foreground': '#C5C8C6',
      'editorLineNumber.foreground': '#C5C8C6',
      'editorGutter.background': '#25282C',
      'editorCursor.foreground': '#AEAFAD',
      'editor.selectionBackground': '#373B41',
      'editor.lineHighlightBackground': '#282A2E',
      'editorLineNumber.activeForeground': '#C5C8C6',
      'editorIndentGuide.background': '#4B4E55',
      'editorWhitespace.foreground': '#4B4E55',
      'editorWidget.background': '#2f3135',
      'editorSuggestWidget.background': '#2f3135',
      'editorSuggestWidget.foreground': '#f9f9f9',
      'editorSuggestWidget.selectedBackground': '#0c41867c',
      'editorHoverWidget.background': '#2f3135',
      'editorHoverWidget.foreground': '#f5f5f5',
    },
  });

  monaco.editor.defineTheme('maiden-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '708090' },
      { token: 'string', foreground: '0B7500' },
      { token: 'keyword', foreground: '794938' },
      { token: 'number', foreground: 'CF6A4C' },
      { token: 'regexp', foreground: 'CF6A4C' },
      { token: 'type', foreground: '811F3F' },
      { token: 'class', foreground: '811F3F' },
      { token: 'function', foreground: '21439C' },
      { token: 'variable', foreground: '21439C' },
      { token: 'constant', foreground: '811F3F' },
      { token: 'tag', foreground: '794938' },
      { token: 'attribute.name', foreground: '994D95' },
    ],
    colors: {
      'editor.background': '#F4F4F4',
      'editor.foreground': '#080808',
      'editorLineNumber.foreground': '#757575',
      'editorGutter.background': '#f7f7f7',
      'editor.lineHighlightBackground': '#f0f0f0',
      'editor.selectionBackground': '#89b5f14f',
      'editorWidget.background': '#FFFFFF',
      'editorSuggestWidget.background': '#FFFFFF',
      'editorHoverWidget.background': '#FFFFFF',
    },
  });
}

export function themeNameForEditorTheme(editorTheme) {
  return editorTheme === 'dark' ? 'maiden-dark' : 'maiden-light';
}
