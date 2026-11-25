// Dark tokens from the previous Ace "norns_dark" / Tomorrow Night theme.
// Light tokens follow Ace Dawn, with chrome colors from maiden CSS variables
// in index.css (--neutral-*).

const dark = {
  background: '#1D1F21', // --neutral-background-default
  surface: '#25282C', // --neutral-surface-default
  highlighted: '#1F2123', // --neutral-surface-highlighted
  selected: '#4B4231', // --neutral-surface-selected
  medium: '#969896', // --neutral-medium-default
  heavy: '#AAAAAA', // --neutral-heavy-default
  trim: '#333333', // --neutral-trim-default
  editorFg: '#C5C8C6',
  hover: '#444444', // --interactive-surface-hover
};

const light = {
  background: '#F4F4F4', // --neutral-background-default
  surface: '#f7f7f7', // --neutral-surface-default
  highlighted: '#f0f0f0', // --neutral-surface-highlighted
  selected: '#89b5f14f', // --neutral-surface-selected
  selectedSolid: '#d3d3d3', // --interactive-surface-hover (opaque menu hover)
  medium: '#757575', // --neutral-medium-default
  heavy: '#434351', // --neutral-heavy-default
  trim: '#DADADA', // --neutral-trim-default
  editorFg: '#080808',
};

function chromeColors({
  background,
  surface,
  highlighted,
  selected,
  selectedSolid,
  medium,
  heavy,
  trim,
  editorFg,
  hover,
}) {
  const focus = selectedSolid || selected || hover || highlighted;
  return {
    'editor.background': background,
    'editor.foreground': editorFg,
    'editorLineNumber.foreground': medium,
    'editorGutter.background': surface,
    'editor.lineHighlightBackground': highlighted,
    'editor.selectionBackground': selected,
    'editorLineNumber.activeForeground': editorFg,
    'editorWidget.background': surface,
    'editorWidget.foreground': medium,
    'editorWidget.border': trim,
    'editorSuggestWidget.background': surface,
    'editorSuggestWidget.foreground': medium,
    'editorSuggestWidget.border': trim,
    'editorSuggestWidget.selectedBackground': focus,
    'editorHoverWidget.background': surface,
    'editorHoverWidget.foreground': medium,
    'editorHoverWidget.border': trim,
    // Context menu — foreground matches file explorer (--neutral-medium-default)
    'menu.background': surface,
    'menu.foreground': medium,
    'menu.separatorBackground': trim,
    'menu.border': trim,
    'menu.selectionBackground': focus,
    'menu.selectionForeground': medium,
    // Command palette / quick input
    'quickInput.background': surface,
    'quickInput.foreground': medium,
    'quickInputTitle.background': highlighted,
    'quickInputList.focusBackground': focus,
    'quickInputList.focusForeground': medium,
    'pickerGroup.foreground': medium,
    'pickerGroup.border': trim,
    'keybindingLabel.background': highlighted,
    'keybindingLabel.foreground': medium,
    'keybindingLabel.border': trim,
    'keybindingLabel.bottomBorder': trim,
    'input.background': background,
    'input.foreground': medium,
    'input.border': trim,
    'list.hoverBackground': highlighted,
    'list.activeSelectionBackground': focus,
    'list.activeSelectionForeground': medium,
    'list.focusBackground': focus,
    'list.focusForeground': medium,
  };
}

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
      ...chromeColors({ ...dark, selectedSolid: dark.selected }),
      'editorCursor.foreground': '#AEAFAD',
      'editorIndentGuide.background': '#4B4E55',
      'editorWhitespace.foreground': '#4B4E55',
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
    colors: chromeColors(light),
  });
}

export function themeNameForEditorTheme(editorTheme) {
  return editorTheme === 'dark' ? 'maiden-dark' : 'maiden-light';
}
