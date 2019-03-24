import React, { Component } from 'react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/mode/lua';
import 'brace/snippets/lua';
import 'brace/theme/dawn';
import 'brace/keybinding/vim';
import 'brace/keybinding/emacs';

import api from './api';
import { commandService, editorService } from './services';

import './editor.css';
import './theme/norns_dark';

class Editor extends Component {
  constructor(props) {
    super(props);
    this.modified = false;
  }

  setOptions = (opts, editor) => {
    const session = this.editor.getSession();
    const clonedOpts = JSON.parse(JSON.stringify(opts));

    if (clonedOpts.keyBoardHandler) {
      editor.setKeyboardHandler(clonedOpts.keyBoardHandler);
      delete clonedOpts.keyBoardHandler;
    } else {
      editor.setKeyboardHandler();
    }

    if (clonedOpts.editorTheme) {
      // theme is not a session option
      delete clonedOpts.editorTheme;
    }

    session.setOptions(clonedOpts);
  };

  onLoad = editor => {
    // grab reference to ace editor
    this.editor = editor;

    const session = this.editor.getSession();
    session.setNewLineMode('unix');

    if (this.props.editorOptions) {
      this.setOptions(this.props.editorOptions, this.editor);
    }

    this.props.editorConfig(api.editorConfigResource());

    // the 'showSettingsMenu' from 'brace/ext/settings_menu' exposes a host of themes and
    // modes we don't want to support (or require unconditionally).
    this.editor.commands.removeCommand('showSettingsMenu');

    // TODO (pq): remove keys bound in the key service to ensure no interference.

    /*
        if (this.refs.ace) {
            window.setTimeout(() => {
                this.refs.ace.editor.focus();
                console.log("OL focused on", this.refs.ace.editor)
            }, 3);
        }
        */
  };

  onChange = event => {
    if (!this.modified) {
      this.modified = true;
      // we are consuming the first change, propagate the now modified buffer up
      this.props.bufferChange(this.props.bufferName, event);
    }
  };

  getValue = () => this.editor.getValue();

  bufferWillSave = bufferName => {
    if (bufferName !== this.props.bufferName) {
      console.log('buffer save mismatch ', bufferName, ' vs ', this.props.bufferName);
    }
    this.props.bufferChange(this.props.bufferName, this.getValue());
  };

  bufferWasSaved = bufferName => {
    if (this.props.bufferName === bufferName) {
      // MAINT: the edit-activity takes care of the modified flag on the buffer state and should call this method to in order to enable dirty
      this.modified = false;
    }
  };

  willChangeSize(newProps) {
    return this.props.height !== newProps.height || this.props.width !== newProps.width;
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.bufferName !== this.props.bufferName || this.willChangeSize(nextProps)) &&
      this.modified
    ) {
      // active buffer is being changed, sync current value to parent view before the editor is re-rendered

      if (this.props.bufferName) {
        // only sync buffer if there is an actual name/resource
        this.props.bufferChange(this.props.bufferName, this.getValue());
      }

      // reset dirty flag so that any change will mark (or remark) the buffer as dirty
      this.modified = false;

      // MAINT: work around a react-ace behavior; it restores the selection when the editor value prop changes but that means the selection is retained when switching between buffers too.
      this.editor.clearSelection();

      // MAINT: really lame, undo stack is global to the single wrapped editor so it extends across buffer switching. call undo repeatly will result in buffer switch (confusingly)
      this.editor
        .getSession()
        .getUndoManager()
        .reset();

      this.editor.getSession().setNewLineMode('unix');
    }

    if (
      nextProps.editorOptions &&
      JSON.stringify(nextProps.editorOptions) !== JSON.stringify(this.props.editorOptions)
    ) {
      this.setOptions(nextProps.editorOptions, this.editor);
    }
  }

  componentWillUnmount() {
    this.props.bufferChange(this.props.bufferName, this.getValue());
  }

  handleEval() {
    const code = this.editor.getSelectedText();
    this.props.selectionEval(code);
  }

  render() {
    const width = `${this.props.width}px`;
    const height = `${this.props.height}px`;

    const mode = editorService.getMode(this.props.bufferName);
    mode.onRender(this.editor);

    const theme = this.props.editorOptions.editorTheme || 'dawn';

    commandService.registerCommand('eval', () => this.handleEval());

    return (
      <AceEditor
        ref="ace"
        mode={mode.id}
        theme={theme}
        width={width}
        height={height}
        value={this.props.value}
        onLoad={this.onLoad}
        onChange={this.onChange}
        showPrintMargin={false}
        enableBasicAutocompletion
        enableSnippets={mode.enableSnippets}
        editorProps={{
          $blockScrolling: Infinity,
          $newLineMode: 'unix',
        }}
      />
    );
  }
}

export default Editor;
