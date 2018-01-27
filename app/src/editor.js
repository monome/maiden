import React, { Component } from 'react';
import AceEditor from 'react-ace';

import 'brace/mode/lua';
import 'brace/theme/dawn';

class Editor extends Component {
    constructor(props) {
        super(props);
        this.modified = false;
    }

    onLoad = (editor) => {
        // grab reference to ace editor
        this.editor = editor;
    }

    onChange = (event) => {
        if (!this.modified) {
            this.modified = true;
            // we are consuming the first change, propagate the now modified buffer up
            this.props.scriptChange(this.props.bufferName, event);
        }
    }

    getValue = () => {
        return this.editor.getValue();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.bufferName !== this.props.bufferName && this.modified) {
            // active buffer is being changed, sync current value to parent view before the editor is re-rendered
            this.props.scriptChange(this.props.bufferName, this.editor.getValue())

            // reset dirty flag so that any change will mark (or remark) the buffer as dirty
            this.modified = false;
        
            // MAINT: work around a react-ace behavior; it restores the selection when the editor value prop changes but that means the selection is retained when switching between buffers too.
            this.editor.clearSelection();
            
            // MAINT: really lame, undo stack is global to the single wrapped editor so it extends across buffer switching. call undo repeatly will result in buffer switch (confusingly)
            this.editor.getSession().getUndoManager().reset();    
        }
    }

    render () {
        const width = `${this.props.width}px`;
        const height = `${this.props.height}px`;

        return (
            <AceEditor
                mode="lua"
                theme="dawn"
                width={width}
                height={height}
                value={this.props.value}
                onLoad={this.onLoad}
                onChange={this.onChange}
                editorProps={{
                    $blockScrolling: Infinity
                }}
            />
        );
    }
}

export default Editor;