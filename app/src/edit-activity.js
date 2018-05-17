import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import Explorer from './explorer';
import Editor from './editor';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import { commandService } from './services';
import OS from './utils';

import ReplActivity from './bound-repl-activity'

import './edit-activity.css';

const tools = [
    {
        name: "save",
        tooltipMessage: `save script (${OS.metaKey()}S)`,
        tooltipPosition: "left",
        icon: ICONS["floppy-disk"],
        disabled: false,
    },
    {
        name: "play",
        tooltipMessage: `run script (${OS.metaKey()}P)`,
        tooltipPosition: "left",
        icon: ICONS["play3"],
        disabled: false,
    },
];

const EditTools = (props) => {
    const items = props.tools.map(tool => {
        return (
            <IconButton
                tooltipMessage={tool.tooltipMessage}
                tooltipPosition={tool.tooltipPosition}
                key={tool.name}
                action={() => props.buttonAction(tool.name)}
                icon={tool.icon}
                color="#979797"       // FIXME:
                disabledColor="rgb(175, 175, 175)"
                size="24"           // FIXME:
                disabled={tool.disabled}
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
            sidebarWidth: props.ui.sidebarWidth,
            editorHeight: props.height - props.ui.replHeight,
        }
    }

    componentWillReceiveProps(newProps) {
        // if the active buffer is dirty grab it out of the child prior to a potential re-render so that the current buffer state isn't lost
        let { activeBuffer, buffers } = this.props;
        let newActiveBuffer = newProps.activeBuffer;
        if ((activeBuffer !== newActiveBuffer) && buffers.has(activeBuffer)) {
            if (this.editor) {
                this.props.bufferChange(activeBuffer, this.editor.getValue());
            }
        }

        let newBuffers = newProps.buffers;
        if (newActiveBuffer && !newBuffers.has(newActiveBuffer)) {
            // active buffer isn't (yet) loaded, trigger read
            this.props.bufferRead(this.props.api, newActiveBuffer);
        }
    }

    sidebarSplitSizing() {
        return {
            size: this.props.ui.sidebarHidden ? 1 : this.state.sidebarWidth,
            minSize: this.props.ui.sidebarMinWidth,
            defaultSize: this.props.ui.sidebarWidth,
            maxSize: this.props.ui.sidebarMaxWidth,
        }
    }

    getSidebarWidth() {
        return this.props.ui.sidebarHidden ? 1 : this.state.sidebarWidth;
    }

    editorSplitSizing() {
        return {
            size: this.getEditorHeight(),
            defaultSize: this.getEditorHeight(),
            minSize: 1,
            maxSize: this.props.height - this.props.ui.replMinHeight,
        }
    }

    getEditorHeight() {
        return this.props.ui.replHidden ? this.props.height : this.state.editorHeight;
    }

    editorSize() {
        const sidebarWidth = this.getSidebarWidth()
        const toolbarWidth = this.state.toolbarWidth;
        const width = this.props.width - sidebarWidth - toolbarWidth - 1;
        return {
            width,
            height: this.getEditorHeight(),
        };
    }

    editorToolsSize() {
        return {
            width: this.state.toolbarWidth,
            height: this.getEditorHeight(),
        };
    }

    getReplHeight() {
        return this.props.height - this.getEditorHeight() - 1;
    }

    replSize() {
        return {
            width: this.props.width - this.getSidebarWidth(),
            height: this.getReplHeight(),
        }
    }

    handleSidebarSplitChange = (size) => {
        if (size <= this.props.ui.sidebarMinWidth && this.props.ui.sidebarHidden) {
            // it is hidden so allow resize to reveal
            this.props.sidebarToggle();
        }
        this.setState({
            sidebarWidth: size,
        });
    }

    handleSidebarSplitDragFinish = () => {
        this.props.sidebarSize(this.state.sidebarWidth)
    }

    handleEditorSplitChange = (size) => {
        this.setState({
            editorHeight: size
        })
    }

    handleEditorSplitDragFinish = () => {
        this.props.replSize(this.getReplHeight());
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
                this.props.bufferSave(this.props.api, resource, this.editor.getValue(), () => {
                    this.editor.bufferWasSaved(resource)
                 })
            }
        }
        else if (tool === 'play') {
            if (buffer.get('modified')) {
                // save, then run
                this.editor.bufferWillSave(resource)
                this.props.bufferSave(this.props.api, resource, this.editor.getValue(), () => {
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

    handleResourceRename = (api, resource, name, virtual) => {
        // MAINT: this annoying; rename changes names, urls, and active this/that which in turn causes a re-render. if the script being renamed is "virtual" then the editor buffer might contain changes which haven't been sync'd to the store. trigger a sync to ensure those changes aren't lost by the rename
        if (virtual) {
            console.log("syncing editor before rename just in case...")
            this.props.bufferChange(this.props.activeBuffer, this.editor.getValue());
        }
        this.props.explorerResourceRename(api, resource, name, virtual);
    }

    isText = (buffer) => {
        if (buffer) {
            return buffer.get("contentType").includes("text")
        }
        return false;
    }

    render() {
        const activeBuffer = this.props.activeBuffer;
        const buffer = this.getActiveBuffer();

        const canEdit = this.isText(buffer);
        const code = canEdit ? buffer.get('value') : '';

        const enabledTools = tools.map(t => {
            t.disabled = !canEdit;
            return t;
        })

        // TODO (pq): move this somewhere more appropriate.
        commandService.registerCommand('toggle repl', () =>
            this.props.replToggle())
        commandService.registerCommand('toggle sidebar', () =>
            this.props.sidebarToggle())
        commandService.registerCommand('play', () =>
            this.handleToolInvoke('play'))
        commandService.registerCommand('save', () =>
            this.handleToolInvoke('save'))
        
        // TODO: switch editor based on buffer content type
        const editor = (
            <div className='editor-pane'>
                <Editor
                    className='editor-container'
                    ref={(component) => {this.editor = component;}}
                    { ...this.editorSize() }
                    bufferName={activeBuffer}
                    toolInvoke={this.handleToolInvoke}
                    editorOptions={this.props.editorOptions}
                    sidebarToggle={this.props.sidebarToggle}
                    value={code}
                    bufferChange={this.props.bufferChange}
                    editorConfig={this.props.editorConfig}
                />
                <EditTools
                    className='edit-tools'
                    { ...this.editorToolsSize() }
                    tools={enabledTools}
                    buttonAction={this.handleToolInvoke}
                />
            </div>
        )

        const sidebarSplitStyle = {
            height: this.props.height,
            width: this.props.width,
            position: "relative",   // must be inline to override library behavior
        };

        return (
            <SplitPane
                split='vertical'
                style={sidebarSplitStyle}
                { ...this.sidebarSplitSizing() }
                onChange={this.handleSidebarSplitChange}
                onDragFinished={this.handleSidebarSplitDragFinish}
                paneClassName='editor-pane-common'
            >
                <Explorer
                    className='explorer-container'
                    hidden={this.props.ui.sidebarHidden}
                    data={this.props.explorerData}
                    bufferSelect={this.props.bufferSelect}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.explorerDirectoryCreate}
                    scriptCreate={this.props.explorerScriptNew}
                    scriptDuplicate={this.props.explorerScriptDuplicate}
                    resourceDelete={this.props.explorerResourceDelete}
                    resourceRename={this.handleResourceRename}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    api={this.props.api}
                    activeBuffer={activeBuffer}
                    activeNode={this.props.activeNode}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                />
                <SplitPane
                    split='horizontal'
                    { ...this.editorSplitSizing() }
                    onChange={this.handleEditorSplitChange}
                    onDragFinished={this.handleEditorSplitDragFinish}
                >
                    {editor}
                    <ReplActivity
                        { ...this.replSize() }
                    />
                </SplitPane>
            </SplitPane>
        );
    }
}

export default EditActivity;