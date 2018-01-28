import React, { Component } from 'react';
import Explorer from './explorer';
import Editor from './editor';
import './edit-view.css';

class EditView extends Component {
    componentDidMount() {
        // get list of scripts
        this.props.scriptList(this.props.api);
    }

    componentWillReceiveProps(newProps) {
        // if the active buffer is dirty grab it out of the child prior to a potential re-render so that the current buffer state isn't lost
        let { activeBuffer, buffers } = this.props.editor;
        let newActiveBuffer = newProps.editor.activeBuffer;
        if ((activeBuffer !== newActiveBuffer) && buffers.has(activeBuffer)) {
            this.props.scriptChange(activeBuffer, this.editor.getValue());
        }
    
        let newBuffers = newProps.editor.buffers;
        if (newActiveBuffer && !newBuffers.has(activeBuffer)) {
            // active buffer isn't (yet) loaded, trigger read
            this.props.scriptRead(this.props.api, newActiveBuffer);
        }
    }

    sidebarSize() {
        return {
            width: this.props.sidebar.width,
            height: this.props.height,
        };
    }

    editorSize() {
        const sidebarWidth = this.props.sidebar.hidden ? 0 : this.props.sidebar.width;
        const width = this.props.width - sidebarWidth;
        return {
            width,
            height: this.props.height,
        };
    }

    render() {
        const { buffers, activeBuffer } = this.props.editor;
        const buffer = buffers.get(activeBuffer);

        const code = buffer ? buffer.get('value') : '';

        return (
            <div className='edit-view'>
                <Explorer
                    className='explorer-container'
                    {...this.sidebarSize()}
                    hidden={this.props.sidebar.hidden}
                    data={this.props.sidebar.data}
                    scriptSelect={this.props.scriptSelect}
                />
                <Editor
                    className='editor-container'
                    ref={(component) => {this.editor = component;}}
                    {...this.editorSize()}
                    bufferName={activeBuffer}
                    value={code}
                    scriptChange={this.props.scriptChange}
                />
            </div>
        );
    }
}

export default EditView;