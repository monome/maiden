import React, { Component } from 'react';
import { initVimMode } from 'monaco-vim';
import { EmacsExtension } from 'monaco-emacs';

import api from './api';
import { commandService, editorService, keyService, keyboardModeFromHandler } from './services';
import { ensureMonaco } from './monaco-setup';
import { themeNameForEditorTheme } from './theme/maiden-themes';

import './editor.css';

// Match Ace's default editor chrome (font stack + normal line-height at 12px).
const EDITOR_FONT_SIZE = 12;
const EDITOR_LINE_HEIGHT = 16;
const EDITOR_FONT_FAMILY = 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace';

/** Badge labels for vim modes we surface (visual stays unmarked). */
function vimBadgeLabel(modeName) {
  if (modeName === 'normal') {
    return 'normal';
  }
  if (modeName === 'insert') {
    return 'insert';
  }
  if (modeName === 'replace') {
    return 'overwrite';
  }
  return null;
}

/** Space to keep between the badge and Monaco's right chrome (minimap / scrollbar). */
const BADGE_RIGHT_GAP = 6;

/** Pixels from the host's right edge so the badge sits left of minimap/scrollbar. */
function badgeRightOffset(editor) {
  if (!editor) {
    return BADGE_RIGHT_GAP;
  }
  const info = editor.getLayoutInfo();
  // Scrollbars overlay the content box in Monaco, so derive chrome from the
  // explicit minimap + scrollbar widths rather than contentWidth remainder.
  const minimapWidth = (info.minimap && info.minimap.width) || 0;
  const rightChrome = minimapWidth + (info.verticalScrollbarWidth || 0);
  return rightChrome + BADGE_RIGHT_GAP;
}

class Editor extends Component {
  constructor(props) {
    super(props);
    this.modified = false;
    this.models = new Map();
    this.vimMode = null;
    this.emacsMode = null;
    this.vimModeChangeHandler = null;
    this.vimPromptObserver = null;
    this.editor = null;
    this.monaco = null;
    this.contentListener = null;
    this.keyDownListener = null;
    this.layoutListener = null;
    this.containerRef = React.createRef();
    this.vimPromptRef = React.createRef();
    this.state = {
      keyboardMode: keyboardModeFromHandler(
        props.editorOptions && props.editorOptions.keyBoardHandler,
      ),
      vimBadge: null,
      emacsChord: '',
      badgeRight: BADGE_RIGHT_GAP,
    };
  }

  componentDidMount() {
    this.monaco = ensureMonaco();
    const opts = this.props.editorOptions || {};
    const theme = themeNameForEditorTheme(opts.editorTheme);

    this.editor = this.monaco.editor.create(this.containerRef.current, {
      model: null,
      automaticLayout: false,
      wordWrap: 'on',
      renderLineHighlight: 'line',
      scrollBeyondLastLine: false,
      fixedOverflowWidgets: true,
      fontSize: EDITOR_FONT_SIZE,
      fontFamily: EDITOR_FONT_FAMILY,
      lineHeight: EDITOR_LINE_HEIGHT,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      showFoldingControls: 'always',
      minimap: { enabled: Boolean(opts.minimap) },
      tabSize: opts.tabSize || 2,
      insertSpaces: opts.useSoftTabs !== false,
      theme,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: 'currentDocument',
      snippetSuggestions: 'inline',
    });

    this.keyDownListener = this.editor.onKeyDown(e => {
      const cmd = keyService.findCommand(e.browserEvent);
      if (cmd) {
        e.preventDefault();
        e.browserEvent.stopPropagation();
        cmd();
      }
    });

    this.layoutListener = this.editor.onDidLayoutChange(() => {
      this.updateBadgeOffset();
    });

    this.switchToBuffer(this.props.bufferName, this.props.value);
    this.applyKeyboardHandler(opts.keyBoardHandler);
    this.layout();

    this.props.editorConfig(api.editorConfigResource());
    commandService.registerCommand('eval', () => this.handleEval());
  }

  componentDidUpdate(prevProps) {
    if (!this.editor) {
      return;
    }

    const bufferChanged = prevProps.bufferName !== this.props.bufferName;
    const sizeChanged =
      prevProps.width !== this.props.width || prevProps.height !== this.props.height;

    if (bufferChanged || (sizeChanged && this.modified)) {
      if (prevProps.bufferName && this.modified) {
        this.props.bufferChange(prevProps.bufferName, this.getValue());
      }
      this.modified = false;
    }

    if (bufferChanged) {
      this.switchToBuffer(this.props.bufferName, this.props.value);
    } else if (
      this.props.value !== prevProps.value &&
      this.editor.getValue() !== this.props.value
    ) {
      const model = this.editor.getModel();
      if (model) {
        model.setValue(this.props.value || '');
      }
      this.modified = false;
    }

    if (sizeChanged) {
      this.layout();
    }

    if (
      this.props.editorOptions &&
      JSON.stringify(this.props.editorOptions) !== JSON.stringify(prevProps.editorOptions)
    ) {
      this.applyEditorOptions(this.props.editorOptions);
    }
  }

  componentWillUnmount() {
    if (this.props.bufferName && this.editor) {
      this.props.bufferChange(this.props.bufferName, this.getValue());
    }
    this.disposeKeyboardModes();
    if (this.contentListener) {
      this.contentListener.dispose();
      this.contentListener = null;
    }
    if (this.keyDownListener) {
      this.keyDownListener.dispose();
      this.keyDownListener = null;
    }
    if (this.layoutListener) {
      this.layoutListener.dispose();
      this.layoutListener = null;
    }
    this.models.forEach(model => model.dispose());
    this.models.clear();
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }

  getValue = () => {
    if (!this.editor) {
      return this.props.value || '';
    }
    return this.editor.getValue();
  };

  bufferWillSave = bufferName => {
    if (bufferName !== this.props.bufferName) {
      console.log('buffer save mismatch ', bufferName, ' vs ', this.props.bufferName);
    }
    this.props.bufferChange(this.props.bufferName, this.getValue());
  };

  bufferWasSaved = bufferName => {
    if (this.props.bufferName === bufferName) {
      this.modified = false;
    }
  };

  modelUriFor(bufferName) {
    const key = bufferName || 'untitled';
    return this.monaco.Uri.parse(`inmemory://maiden/${encodeURIComponent(key)}`);
  }

  getOrCreateModel(bufferName, value) {
    const key = bufferName || 'untitled';
    let model = this.models.get(key);
    if (model) {
      return model;
    }
    const languageId = editorService.getLanguageId(bufferName);
    model = this.monaco.editor.createModel(value || '', languageId, this.modelUriFor(bufferName));
    model.setEOL(this.monaco.editor.EndOfLineSequence.LF);
    this.models.set(key, model);
    return model;
  }

  attachContentListener() {
    if (this.contentListener) {
      this.contentListener.dispose();
    }
    this.contentListener = this.editor.onDidChangeModelContent(() => {
      if (!this.modified) {
        this.modified = true;
        this.props.bufferChange(this.props.bufferName, this.getValue());
      }
    });
  }

  switchToBuffer(bufferName, value) {
    const model = this.getOrCreateModel(bufferName, value);
    // If the model already exists but the prop value is a fresh load for this
    // resource, keep the in-memory model (it holds undo + unsaved edits).
    this.editor.setModel(model);
    this.attachContentListener();
  }

  applyEditorOptions(opts) {
    const cloned = { ...(opts || {}) };
    const theme = themeNameForEditorTheme(cloned.editorTheme);
    this.monaco.editor.setTheme(theme);

    this.editor.updateOptions({
      minimap: { enabled: Boolean(cloned.minimap) },
      tabSize: cloned.tabSize || 2,
      insertSpaces: cloned.useSoftTabs !== false,
      wordWrap: 'on',
    });

    this.applyKeyboardHandler(cloned.keyBoardHandler);
  }

  disposeKeyboardModes() {
    if (this.vimPromptObserver) {
      this.vimPromptObserver.disconnect();
      this.vimPromptObserver = null;
    }
    if (this.vimMode && this.vimModeChangeHandler) {
      this.vimMode.off('vim-mode-change', this.vimModeChangeHandler);
      this.vimModeChangeHandler = null;
    }
    if (this.vimMode) {
      this.vimMode.dispose();
      this.vimMode = null;
    }
    if (this.emacsMode) {
      this.emacsMode.dispose();
      this.emacsMode = null;
    }
    if (this.vimPromptRef.current) {
      this.vimPromptRef.current.replaceChildren();
      this.vimPromptRef.current.style.display = 'none';
    }
  }

  syncVimPromptVisibility = () => {
    const node = this.vimPromptRef.current;
    if (!node) {
      return;
    }
    // monaco-vim always mounts mode/key spans; only surface the strip for
    // command-line inputs (`:`, `/`) or notifications.
    const hasInput = Boolean(node.querySelector('input'));
    const notif = node.querySelector('.vim-notification');
    const hasNotif = Boolean(notif && notif.textContent);
    node.style.display = hasInput || hasNotif ? 'block' : 'none';
  };

  applyKeyboardHandler(keyBoardHandler) {
    const mode = keyboardModeFromHandler(keyBoardHandler);
    this.disposeKeyboardModes();

    const nextState = { keyboardMode: mode, vimBadge: null, emacsChord: '' };

    if (mode === 'vim') {
      // Pass a prompt node so `:` / search still have a DOM target; mode is
      // shown via the floating badge instead of a status strip.
      this.vimMode = initVimMode(this.editor, this.vimPromptRef.current);
      nextState.vimBadge = 'normal';
      this.vimModeChangeHandler = ev => {
        this.setState({ vimBadge: vimBadgeLabel(ev.mode) });
      };
      this.vimMode.on('vim-mode-change', this.vimModeChangeHandler);
      if (this.vimPromptRef.current) {
        this.vimPromptObserver = new MutationObserver(this.syncVimPromptVisibility);
        this.vimPromptObserver.observe(this.vimPromptRef.current, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        this.syncVimPromptVisibility();
      }
    } else if (mode === 'emacs') {
      this.emacsMode = new EmacsExtension(this.editor);
      this.emacsMode.onDidChangeKey(str => {
        this.setState({ emacsChord: str || '' });
      });
      this.emacsMode.start();
    }

    this.setState(nextState, () => this.layout());
  }

  layout() {
    if (!this.editor) {
      return;
    }
    this.editor.layout({ width: this.props.width, height: this.props.height });
    this.updateBadgeOffset();
  }

  updateBadgeOffset() {
    const next = badgeRightOffset(this.editor);
    if (this.state.badgeRight !== next) {
      this.setState({ badgeRight: next });
    }
  }

  handleEval() {
    if (!this.editor) {
      return;
    }
    const selection = this.editor.getSelection();
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    let code = model.getValueInRange(selection);
    if (code === '') {
      code = model.getLineContent(selection.startLineNumber);
    }
    this.props.selectionEval(code.replace(/--.*\n/g, ';').replace(/\n/g, ';'));
  }

  render() {
    const width = `${this.props.width}px`;
    const height = `${this.props.height}px`;
    const { keyboardMode, vimBadge, emacsChord, badgeRight } = this.state;
    const showVimBadge = keyboardMode === 'vim' && vimBadge;
    const showEmacsBadge = keyboardMode === 'emacs' && emacsChord;
    const badgeStyle = { right: badgeRight };

    return (
      <div className="monaco-editor-host" style={{ width, height }}>
        <div
          ref={this.containerRef}
          className="monaco-editor-container"
          style={{ width, height }}
        />
        {showVimBadge && (
          <div className="monaco-editor-mode-badge" style={badgeStyle} aria-live="polite">
            {vimBadge}
          </div>
        )}
        {showEmacsBadge && (
          <div className="monaco-editor-mode-badge" style={badgeStyle} aria-live="polite">
            {emacsChord}
          </div>
        )}
        <div ref={this.vimPromptRef} className="monaco-editor-vim-prompt" />
      </div>
    );
  }
}

export default Editor;
