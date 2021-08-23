import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import ReactAudioPlayer from 'react-audio-player';
import Explorer from './explorer';
import Editor from './editor';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import { commandService } from './services';
import OS from './utils';
import { bufferIsEditable } from './model/edit-helpers';
import { bufferIsAudio } from './model/edit-helpers';
import ReplActivity from './bound-repl-activity';

import './edit-activity.css';

const tools = [
  {
    name: 'save',
    tooltipMessage: `save script (${OS.metaKey()}S)`,
    tooltipPosition: 'left',
    icon: ICONS['floppy-disk'],
    disabled: false,
  },
  {
    name: 'play',
    tooltipMessage: `run script (${OS.metaKey()}P)`,
    tooltipPosition: 'left',
    icon: ICONS.play3,
    disabled: false,
  },
  {
    name: 'stop',
    tooltipMessage: `stop script (${OS.metaKey()}.)`,
    tooltipPosition: 'left',
    icon: ICONS.stop,
    disable: false,
    alwaysEnable: true,
  },
];

const EditTools = props => {
  const items = props.tools.map(tool => (
    <IconButton
      tooltipMessage={tool.tooltipMessage}
      tooltipPosition={tool.tooltipPosition}
      key={tool.name}
      action={() => props.buttonAction(tool.name)}
      icon={tool.icon}
      color="hsl(0, 0%, 59%)"
      size="24" // FIXME:
      disabled={tool.disabled}
    />
  ));

  const style = { width: props.width, height: props.height };
  return <ToolBar style={style}>{items}</ToolBar>;
};

class EditActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toolbarWidth: 50,
      sidebarWidth: props.ui.sidebarWidth,
      replHeight: props.ui.replHeight,
    };
  }

  componentWillReceiveProps(newProps) {
    // if the active buffer is dirty grab it out of the child prior to a potential re-render so that the current buffer state isn't lost
    const { activeBuffer, buffers } = this.props;
    const newActiveBuffer = newProps.activeBuffer;
    if (activeBuffer !== newActiveBuffer && buffers.has(activeBuffer)) {
      if (this.editor) {
        this.props.bufferChange(activeBuffer, this.editor.getValue());
      }
    }

    const newBuffers = newProps.buffers;
    if (newActiveBuffer && !newBuffers.has(newActiveBuffer)) {
      // active buffer isn't (yet) loaded, trigger read
      this.props.bufferRead(newActiveBuffer);
    }
  }

  sidebarSplitSizing() {
    return {
      size: this.props.ui.sidebarHidden ? 1 : this.state.sidebarWidth,
      minSize: this.props.ui.sidebarMinWidth,
      defaultSize: this.props.ui.sidebarWidth,
      maxSize: this.props.ui.sidebarMaxWidth,
    };
  }

  getSidebarWidth() {
    return this.props.ui.sidebarHidden ? 1 : this.state.sidebarWidth;
  }

  replSplitSizing() {
    return {
      size: this.props.ui.replHidden? 0 : this.state.replHeight,
      minSize: this.props.ui.replMinHeight,
      defaultSize: this.props.ui.replMinHeight,
      maxSize: this.props.height - this.props.ui.editorMinHeight,
    };
  }

  getEditorHeight() {
    return this.props.ui.replHidden ? this.props.height : this.props.height - this.state.replHeight - 1;
  }

  editorSize() {
    const sidebarWidth = this.getSidebarWidth();
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

  replSize() {
    return {
      width: this.props.width - this.getSidebarWidth(),
      height: this.state.replHeight,
    };
  }

  handleSidebarSplitChange = size => {
    if (size <= this.props.ui.sidebarMinWidth && this.props.ui.sidebarHidden) {
      // it is hidden so allow resize to reveal
      this.props.sidebarToggle();
    }
    this.setState({
      sidebarWidth: size,
    });
  };

  handleSidebarSplitDragFinish = () => {
    this.props.sidebarSize(this.state.sidebarWidth);
  };

  handleReplSplitChange = size => {
    this.setState({
      replHeight: size,
    });
  };

  handleReplSplitDragFinish = () => {
    this.props.replSize(this.state.replHeight);
  };

  getActiveBuffer = () => this.props.buffers.get(this.props.activeBuffer);

  handleToolInvoke = tool => {
    const buffer = this.getActiveBuffer();
    const resource = this.props.activeBuffer; // FIXME: this assumes the activeBuffer is a URL

    if (tool === 'stop') {
      this.props.scriptClear();
      return;
    }

    // remaining tools require a buffer
    if (!buffer) {
      return;
    }

    if (tool === 'save') {
      if (buffer.get('modified')) {
        this.editor.bufferWillSave(resource);
        this.props.bufferSave(resource, this.editor.getValue(), () => {
          this.editor.bufferWasSaved(resource);
        });
      }
    } else if (tool === 'play') {
      if (buffer.get('modified')) {
        // save, then run
        this.editor.bufferWillSave(resource);
        this.props.bufferSave(resource, this.editor.getValue(), () => {
          this.editor.bufferWasSaved(resource);
          this.props.scriptRun(resource);
        });
      } else {
        // not modified, just run
        this.props.scriptRun(resource);
      }
    } else {
      // fallthrough behavior
      this.props.toolInvoke(tool);
    }
  };

  handleResourceRename = (resource, name, virtual) => {
    // MAINT: this annoying; rename changes names, urls, and active this/that which in turn causes a re-render. if the script being renamed is "virtual" then the editor buffer might contain changes which haven't been sync'd to the store. trigger a sync to ensure those changes aren't lost by the rename
    if (virtual) {
      console.log('syncing editor before rename just in case...');
      this.props.bufferChange(this.props.activeBuffer, this.editor.getValue());
    }
    this.props.explorerResourceRename(resource, name, virtual);
  };

  isText = buffer => {
    return buffer && bufferIsEditable(buffer);
  };

  isAudio = buffer => {
    return buffer && bufferIsAudio(buffer);
  }

  render() {
    const activeBuffer = this.props.activeBuffer;
    const buffer = this.getActiveBuffer();

    const canEdit = this.isText(buffer);
    const code = canEdit ? buffer.get('value') : '';

    const canListen = this.isAudio(buffer);

    const enabledTools = tools.map(t => ({ ...t, disabled: !(canEdit || t.alwaysEnable) }));

    // TODO (pq): move this somewhere more appropriate.
    commandService.registerCommand('toggle repl', () => this.props.replToggle());
    commandService.registerCommand('toggle sidebar', () => this.props.sidebarToggle());
    commandService.registerCommand('play', () => this.handleToolInvoke('play'));
    commandService.registerCommand('save', () => this.handleToolInvoke('save'));
    commandService.registerCommand('stop', () => this.handleToolInvoke('stop'));

    // TODO: switch editor based on buffer content type
    const editor = (
      <div className="editor-pane">
        <Editor
          className="editor-container"
          ref={component => {
            this.editor = component;
          }}
          {...this.editorSize()}
          bufferName={activeBuffer}
          toolInvoke={this.handleToolInvoke}
          editorOptions={this.props.editorOptions}
          sidebarToggle={this.props.sidebarToggle}
          value={code}
          bufferChange={this.props.bufferChange}
          editorConfig={this.props.editorConfig}
          selectionEval={this.props.selectionEval}
        />
        <EditTools
          className="edit-tools"
          {...this.editorToolsSize()}
          tools={enabledTools}
          buttonAction={this.handleToolInvoke}
        />
      </div>
    );

    const listener = (
      <div className="listener-pane">
        <ReactAudioPlayer
          className="listener-container"
          src={activeBuffer}
          autoPlay
          controls
        />
      </div>
    )

    const sidebarSplitStyle = {
      height: this.props.height,
      width: this.props.width,
      position: 'relative', // must be inline to override library behavior
    };

    const explorerStyle = {
      height: this.props.height,
    }

    if (canListen) {
      return (
        <SplitPane
          split="vertical"
          style={sidebarSplitStyle}
          {...this.sidebarSplitSizing()}
          onChange={this.handleSidebarSplitChange}
          onDragFinished={this.handleSidebarSplitDragFinish}
          paneClassName="editor-pane-common"
        >
          <Explorer
            className="explorer-container"
            hidden={this.props.ui.sidebarHidden}
            style={explorerStyle}
            data={this.props.explorerData}
            bufferSelect={this.props.bufferSelect}
            directoryRead={this.props.directoryRead}
            directoryCreate={this.props.explorerDirectoryCreate}
            scriptCreate={this.props.explorerScriptNew}
            scriptDuplicate={this.props.explorerScriptDuplicate}
            resourceDelete={this.props.explorerResourceDelete}
            resourceRename={this.handleResourceRename}
            collapsedCategories={this.props.collapsedCategories}
            explorerToggleCategory={this.props.explorerToggleCategory}
            explorerToggleNode={this.props.explorerToggleNode}
            explorerActiveNode={this.props.explorerActiveNode}
            activeBuffer={activeBuffer}
            activeNode={this.props.activeNode}
            showModal={this.props.showModal}
            hideModal={this.props.hideModal}
          />
          <SplitPane
            split="horizontal"
            primary="second"
            {...this.replSplitSizing()}
            onChange={this.handleReplSplitChange}
            onDragFinished={this.handleReplSplitDragFinish}
          >
            {listener}
            <ReplActivity {...this.replSize()} />
          </SplitPane>
        </SplitPane>
      );
    }

    return (
      <SplitPane
        split="vertical"
        style={sidebarSplitStyle}
        {...this.sidebarSplitSizing()}
        onChange={this.handleSidebarSplitChange}
        onDragFinished={this.handleSidebarSplitDragFinish}
        paneClassName="editor-pane-common"
      >
        <Explorer
          className="explorer-container"
          hidden={this.props.ui.sidebarHidden}
          style={explorerStyle}
          data={this.props.explorerData}
          bufferSelect={this.props.bufferSelect}
          directoryRead={this.props.directoryRead}
          directoryCreate={this.props.explorerDirectoryCreate}
          scriptCreate={this.props.explorerScriptNew}
          scriptDuplicate={this.props.explorerScriptDuplicate}
          resourceDelete={this.props.explorerResourceDelete}
          resourceRename={this.handleResourceRename}
          collapsedCategories={this.props.collapsedCategories}
          explorerToggleCategory={this.props.explorerToggleCategory}
          explorerToggleNode={this.props.explorerToggleNode}
          explorerActiveNode={this.props.explorerActiveNode}
          activeBuffer={activeBuffer}
          activeNode={this.props.activeNode}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
        />
        <SplitPane
          split="horizontal"
          primary="second"
          {...this.replSplitSizing()}
          onChange={this.handleReplSplitChange}
          onDragFinished={this.handleReplSplitDragFinish}
        >
          {editor}
          <ReplActivity {...this.replSize()} />
        </SplitPane>
      </SplitPane>
    );
  }
}

export default EditActivity;
