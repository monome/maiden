import React, { Component } from 'react';
import Explorer from './explorer';
import Editor from './editor';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import { UNTITLED_SCRIPT } from './constants';

import './edit-activity.css';

const tools = [
    {
        name: "save",
        icon: ICONS["floppy-disk"],
    },
    {
        name: "play",
        icon: ICONS["play3"],
    },
];

const EditTools = (props) => {
    const items = props.tools.map(tool => {
        return (
            <IconButton
                key={tool.name}
                action={() => props.buttonAction(tool.name)}
                icon={tool.icon}
                color="#979797"       // FIXME:
                size="24"           // FIXME:
            />
        );
    });

    const style = { width: props.width, height: props.height };
    return (
        <ToolBar style={style}>
            {items}
        </ToolBar>
    );
};

class EditActivity extends Component {
    constructor(props) {
        super(props)
        this.state = {
            toolbarWidth: 50,
        }
    }

    componentWillReceiveProps(newProps) {
        // if the active buffer is dirty grab it out of the child prior to a potential re-render so that the current buffer state isn't lost
        let { activeBuffer, buffers } = this.props;
        let newActiveBuffer = newProps.activeBuffer;
        if ((activeBuffer !== newActiveBuffer) && buffers.has(activeBuffer)) {
            this.props.scriptChange(activeBuffer, this.editor.getValue());
        }
        
        let newBuffers = newProps.buffers;
        if (newActiveBuffer && !newBuffers.has(newActiveBuffer)) {
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
        const toolbarWidth = this.state.toolbarWidth;
        const width = this.props.width - sidebarWidth - toolbarWidth;
        return {
            width,
            height: this.props.height,
        };
    }

    toolsSize() {
        return {
            width: this.state.toolbarWidth,
            height: this.props.height,
        };
    }

    getActiveBuffer = () => {
        return this.props.buffers.get(this.props.activeBuffer);
    }

    handleToolInvoke = (tool) => {
        const buffer = this.getActiveBuffer()
        const resource = this.props.activeBuffer;  // FIXME: this assumes the activeBuffer is a URL

        if (!buffer) {
            return
        }

        if (tool === 'save') {
            if (buffer.get('modified')) {
                this.editor.bufferWillSave(resource)
                this.props.scriptSave(this.props.api, resource, this.editor.getValue(), () => {
                    this.editor.bufferWasSaved(resource)
                 })
            }
        } 
        else if (tool === 'play') {
            if (buffer.get('modified')) {
                // save, then run
                this.editor.bufferWillSave(resource)
                this.props.scriptSave(this.props.api, resource, this.editor.getValue(), () => {
                    this.editor.bufferWasSaved(resource)
                    this.props.scriptRun(this.props.api, resource)
                })
            } 
            else {
                // not modified, just run
                this.props.scriptRun(this.props.api, resource)
            }
        } 
        else {
            // fallthrough behavior
            this.props.toolInvoke(tool)
        }
    }

    render() {
        const activeBuffer = this.props.activeBuffer ? this.props.activeBuffer : UNTITLED_SCRIPT;
        const buffer = this.getActiveBuffer();
        const code = buffer ? buffer.get('value') : '';

        return (
            <div className='edit-activity'>
                <Explorer
                    className='explorer-container'
                    {...this.sidebarSize()}
                    hidden={this.props.sidebar.hidden}
                    data={this.props.scriptListing}
                    scriptSelect={this.props.scriptSelect}
                    scriptDirRead={this.props.scriptDirRead}
                    scriptCreate={this.props.explorerScriptNew}
                    scriptDuplicate={this.props.explorerScriptDuplicate}
                    scriptDelete={this.props.explorerScriptDelete}
                    scriptRename={this.props.explorerScriptRename}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    api={this.props.api}
                    activeBuffer={activeBuffer}
                    activeNode={this.props.activeNode}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                />
                <Editor
                    className='editor-container'
                    ref={(component) => {this.editor = component;}}
                    {...this.editorSize()}
                    bufferName={activeBuffer}
                    value={code}
                    scriptChange={this.props.scriptChange}
                />
                <EditTools
                    className='edit-tools'
                    {...this.toolsSize()}
                    tools={tools}
                    buttonAction={this.handleToolInvoke}
                />
            </div>
        );
    }
}

export default EditActivity;