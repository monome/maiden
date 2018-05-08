import React, { Component } from 'react';
import AceEditor from 'react-ace';

import './editor.css';

/* eslint-disable import/first */
import 'brace/mode/lua';
import 'brace/theme/dawn';
/* eslint-enable import/first */

class Editor extends Component {
  constructor(props) {
    super(props);
    this.modified = false;
  }

    onLoad = (editor) => {
      // grab reference to ace editor
      this.editor = editor;

      const session = this.editor.getSession();
      session.setNewLineMode('unix');
      session.setOptions({
        tabSize: 2, // MAINT: make this configurable
        useSoftTabs: true,
      });

      // suppress the default print margin.
      editor.setPrintMarginColumn(-1);

      /*
        if (this.refs.ace) {
            window.setTimeout(() => {
                this.refs.ace.editor.focus();
                console.log("OL focused on", this.refs.ace.editor)
            }, 3);
        }
        */
    }

    onChange = (event) => {
      if (!this.modified) {
        this.modified = true;
        // we are consuming the first change, propagate the now modified buffer up
        this.props.bufferChange(this.props.bufferName, event);
      }
    }

    getValue = () => this.editor.getValue()

    bufferWillSave = (bufferName) => {
      if (bufferName !== this.props.bufferName) {
        console.log('buffer save mismatch ', bufferName, ' vs ', this.props.bufferName);
      }
      this.props.bufferChange(this.props.bufferName, this.getValue());
    }

    bufferWasSaved = (bufferName) => {
      if (this.props.bufferName === bufferName) {
        // MAINT: the edit-activity takes care of the modified flag on the buffer state and should
        // call this method to in order to enable dirty
        this.modified = false;
      }
    }

    willChangeSize(newProps) {
      return this.props.height !== newProps.height || this.props.width !== newProps.width;
    }

    componentWillReceiveProps(nextProps) {
      if ((nextProps.bufferName !== this.props.bufferName ||
             this.willChangeSize(nextProps)) && this.modified) {
        // active buffer is being changed, sync current value to parent view before the editor is
        // re-rendered

        if (this.props.bufferName) {
          // only sync buffer if there is an actual name/resource
          this.props.bufferChange(this.props.bufferName, this.getValue());
        }

        // reset dirty flag so that any change will mark (or remark) the buffer as dirty
        this.modified = false;

        // MAINT: work around a react-ace behavior; it restores the selection when the editor value
        // prop changes but that means the selection is retained when switching between buffers too.
        this.editor.clearSelection();

        // MAINT: really lame, undo stack is global to the single wrapped editor so it extends
        // across buffer switching. call undo repeatly will result in buffer switch (confusingly)
        this.editor.getSession().getUndoManager().reset();

        this.editor.getSession().setNewLineMode('unix');
      }
    }

    componentWillUnmount() {
      this.props.bufferChange(this.props.bufferName, this.getValue());
    }

    /*
    componentDidMount = () => {
        // this.editor.focus()
        window.setTimeout(() => {
            this.refs.ace.editor.focus();
            console.log("CDM focused on", this.refs.ace.editor)
        }, 3);

        //this.refs.ace.editor.focus();

    }
    */

    render() {
      const width = `${this.props.width}px`;
      const height = `${this.props.height}px`;

      return (
        <AceEditor
          ref="ace"
          mode="lua"
          theme="dawn"
          width={width}
          height={height}
          value={this.props.value}
          onLoad={this.onLoad}
          onChange={this.onChange}
          showPrintMargin={false}
          commands={[
                  {
                    name: 'save',
                    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                    exec: () => this.props.toolInvoke('save'),
                  },
                  {
                    name: 'play',
                    bindKey: { win: 'Ctrl-P', mac: 'Command-P' },
                    exec: () => this.props.toolInvoke('play'),
                  },
                  {
                    name: 'toggle sidebar',
                    bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
                    exec: () => this.props.sidebarToggle(),
                  },
                ]}
          editorProps={{
                    $blockScrolling: Infinity,
                    $newLineMode: 'unix',
                }}
        />
      );
    }
}

export default Editor;
