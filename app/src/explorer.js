import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import cx from 'classname';
import treeStyle from './explorer-style';
import treeAnim from './explorer-animation';
import './explorer.css';

import ModalContent from './modal-content';
import ModalRename from './modal-rename';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';

const TreeHeader = (props) => {
  const className = cx('explorer-entry', 'noselect', { dirty: props.node.modified }, { active: props.node.active });
  return (
    <span className={className}>
      {props.node.name}
    </span>
  );
};

const TreeToggle = ({ style }) => {
  const { height, width } = style;
  const midHeight = height * 0.5;
  const points = `0,0 0,${height} ${width},${midHeight}`;

  return (
    <span className="explorer-tree-toggle" style={style.base}>
      <svg height={height} width={width}>
        <polygon points={points} style={style.arrow} />
      </svg>
    </span>
  );
};

const explorerDecorators = {
  ...decorators,
  Header: TreeHeader,
  Toggle: TreeToggle,
};

// TODO: turn this in a containing component called Section so that individual sections can be
// collapsed and expanded
const SectionHeader = (props) => {
  const tools = props.tools.map(tool => (
    <IconButton
      key={tool.name}
      tooltipMessage={tool.tooltipMessage}
      tooltipPosition={tool.tooltipPosition}
      action={() => props.buttonAction(tool.name)}
      icon={tool.icon}
      size="12"
      padding="1"
      color="#e4e4e4"
    />
  ));

  return (
    <div className="explorer-header">
      <span className="section-name">{props.name}</span>
      <span
        className={cx('section-tools', { opaque: props.showTools })}
      >
        {tools}
      </span>
    </div>
  );
};

class Section extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTools: false,
      selectedNode: undefined,
    };
  }

  componentDidMount() {
    this.section.onmouseenter = (_e) => {
      this.setState({
        showTools: true,
      });
    };
    this.section.onmouseleave = (_e) => {
      this.setState({
        showTools: false,
      });
    };
  }

    onToggle = (node, toggled) => {
      if (node.children) {
        this.props.explorerToggleNode(node, toggled);
        if (toggled) {
          this.props.directoryRead(this.props.api, node.url);
        }
      } else {
        this.props.bufferSelect(node.url);
      }

      this.setState({ selectedNode: node });
    }

    onToolClick = (name) => {
      // add doesn't (necessarily) require a selection
      if (name === 'add') {
        let selection;
        if (this.state.selectedNode) {
          selection = this.state.selectedNode.url;
        }
        this.props.scriptCreate(
          selection, // sibling resource
          undefined, // initial buffer contents
          undefined, // buffer name
          this.props.name,
        ); // buffer category
        return;
      }

      // other tools only function if there is a selection, ensure there is one and it is from this
      // category
      const activeBuffer = this.props.activeBuffer;
      if (activeBuffer === undefined) {
        return;
      }

      const category = this.props.api.categoryFromResource(activeBuffer);
      if (category !== this.props.name) {
        console.log('ignoring tool, active buffer is not in category', category);
        return;
      }

      /*
        STOPPED HERE; use CATEGORY to gate invocation instead of selectionURL != activeBuffer stuff.

        ensure duplicate then remove/rename works w/out having to reselect the item

        ensure script create puts a new file in the correct category
*/
      switch (name) {
        case 'duplicate':
          this.props.scriptDuplicate(this.props.activeBuffer);
          break;

        case 'remove':
          this.handleRemove(this.props.activeNode);
          break;

        case 'rename':
          this.handleRename(this.props.activeNode);
          break;

        default:
          console.log(name);
          break;
      }
    }

    handleRemove = (selection) => {
      if (selection === undefined) {
        console.log('handleRemove: selection undefined?');
        return;
      }

      const removeModalCompletion = (choice) => {
        console.log('remove:', choice);
        if (choice === 'ok') {
          this.props.resourceDelete(this.props.api, selection.get('url'));
        }
        this.props.hideModal();
      };

      const scriptName = selection.get('name');
      const content = (
        <ModalContent
          message={`Delete "${scriptName}"?`}
          supporting="This operation cannot be undone."
          buttonAction={removeModalCompletion}
        />
      );

      this.props.showModal(content);
    }

    handleRename = (selection) => {
      if (selection === undefined) {
        console.log('handleRename: selection undefined?');
        return;
      }

      const complete = (choice, name) => {
        console.log('rename:', choice, name);
        if (name && choice === 'ok') {
          this.props.resourceRename(
            this.props.api,
            selection.get('url'),
            name,
            selection.get('virtual') || false,
          );
        }
        this.props.hideModal();
      };

      const initialName = selection.get('name');
      const content = (
        <ModalRename message="Rename" buttonAction={complete} initialName={initialName} />
      );

      this.props.showModal(content);
    }


    getData() {
      const node = this.props.data.find(n => n.name === this.props.name);
      if (node) {
        return node.children;
      }
      return [];
    }

    render() {
      const data = this.getData();

      return (
        <div
          className="explorer-section"
          ref={elem => this.section = elem}
        >
          <SectionHeader
            name={this.props.name}
            tools={this.props.tools}
            buttonAction={this.onToolClick}
            showTools={this.state.showTools}
          />
          <Treebeard
            style={treeStyle}
            animations={treeAnim}
            data={data}
            onToggle={this.onToggle}
            decorators={explorerDecorators}
          />
        </div>
      );
    }
}

const scriptTools = [
  {
    name: 'add',
    icon: ICONS.plus,
    tooltipMessage: 'new script',
  },
  {
    name: 'remove',
    icon: ICONS.minus,
    tooltipMessage: 'delete script',
  },
  {
    name: 'duplicate',
    icon: ICONS.copy,
    tooltipMessage: 'duplicate script',
  },
  {
    name: 'new-folder',
    icon: ICONS['folder-plus'],
    tooltipMessage: 'new folder',
  },
  {
    name: 'rename',
    icon: ICONS.pencil,
    tooltipMessage: 'rename file/folder',
  },
];

const audioTools = [
  {
    name: 'remove',
    icon: ICONS.minus,
    tooltipMessage: 'delete audio file',
  },
  {
    name: 'new-folder',
    icon: ICONS['folder-plus'],
    tooltipMessage: 'new folder',
  },
  {
    name: 'rename',
    icon: ICONS.pencil,
    tooltipMessage: 'rename file/folder',
  },
];

const dataTools = [
  {
    name: 'add',
    icon: ICONS.plus,
    tooltipMessage: 'new data file',
  },
  {
    name: 'remove',
    icon: ICONS.minus,
    tooltipMessage: 'delete data file',
  },
  {
    name: 'duplicate',
    icon: ICONS.copy,
    tooltipMessage: 'duplicate data file',
  },
  {
    name: 'new-folder',
    icon: ICONS['folder-plus'],
    tooltipMessage: 'new folder',
  },
  {
    name: 'rename',
    icon: ICONS.pencil,
    tooltipMessage: 'rename file/folder',
  },
];


class Explorer extends Component {
  render() {
    const { width, height } = this.props;

    return (
      <div
        className={`explorer${this.props.hidden ? ' hidden' : ''}`} // FIXME: change this to use classname
        style={{ width, height }}
        ref={elem => this.explorer = elem}
      >
        <Section
          name="scripts"
          tools={scriptTools}
          buttonAction={this.onToolClick}
          data={this.props.data}
          explorerToggleNode={this.props.explorerToggleNode}
          bufferSelect={this.props.bufferSelect}
          directoryRead={this.props.directoryRead}
          scriptCreate={this.props.scriptCreate}
          scriptDuplicate={this.props.scriptDuplicate}
          resourceDelete={this.props.resourceDelete}
          resourceRename={this.props.resourceRename}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
          api={this.props.api}
          activeBuffer={this.props.activeBuffer}
          activeNode={this.props.activeNode}
        />
        <Section
          name="audio"
          tools={audioTools}
          buttonAction={this.onToolClick}
          data={this.props.data}
          explorerToggleNode={this.props.explorerToggleNode}
          bufferSelect={this.props.bufferSelect}
          scriptCreate={this.props.scriptCreate}
          scriptDuplicate={this.props.scriptDuplicate}
          directoryRead={this.props.directoryRead}
          resourceDelete={this.props.resourceDelete}
          resourceRename={this.props.resourceRename}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
          api={this.props.api}
          activeBuffer={this.props.activeBuffer}
          activeNode={this.props.activeNode}
        />
        <Section
          name="data"
          tools={dataTools}
          buttonAction={this.onToolClick}
          data={this.props.data}
          explorerToggleNode={this.props.explorerToggleNode}
          bufferSelect={this.props.bufferSelect}
          scriptCreate={this.props.scriptCreate}
          scriptDuplicate={this.props.scriptDuplicate}
          directoryRead={this.props.directoryRead}
          resourceDelete={this.props.resourceDelete}
          resourceRename={this.props.resourceRename}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
          api={this.props.api}
          activeBuffer={this.props.activeBuffer}
          activeNode={this.props.activeNode}
        />
      </div>
    );
  }
}

export default Explorer;
