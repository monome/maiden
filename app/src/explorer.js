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
import { siblingResourceForName } from './api';

const TreeHeader = (props) => {
    let className = cx('explorer-entry', 'noselect', {'dirty': props.node.modified}, {'active': props.node.active});
    return (
        <span className={className}>
            {props.node.name}
        </span>
    );
};

const TreeToggle = ({style}) => {
    const {height, width} = style;
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

// TODO: turn this in a containing component called Section so that individual sections can be collapsed and expanded
const SectionHeader = (props) => {
    let tools = props.tools.map(tool => {
        return (
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
        );
    });

    return (
        <div className='explorer-header'>
            <span className='section-name'>{props.name}</span>
            <span
                className={cx('section-tools', {'opaque': props.showTools})}
            >
                {tools}
            </span>
        </div>
    );
}

class Section extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showTools: false,
            selectedNode: undefined,
        }
    }

    componentDidMount() {
        this.section.onmouseenter = (e) => {
            this.setState({
                showTools: true,
            })
        }
        this.section.onmouseleave = (e) => {
            this.setState({
                showTools: false,
            })
        }
    }
    
    onToggle = (node, toggled) => {
        if (node.children) {
            this.props.explorerToggleNode(node, toggled)
            if (toggled) {
                this.props.directoryRead(this.props.api, node.url);
            }
        } else {
            this.props.bufferSelect(node.url);
        }

        this.setState({ selectedNode: node });
    }

    onToolClick = (name) => {
        let selectedResource = this.state.selectedNode ? this.state.selectedNode.url : undefined;

        // add doesn't (necessarily) require a selection
        if (name === 'add') {
            this.props.scriptCreate(
                selectedResource,         // sibling resource
                undefined,                // initial buffer contents
                undefined,                // buffer name
                this.getCategory());      // buffer category
            return;
        }
        
        if (name === 'new-folder') {
            this.handleNewFolder(selectedResource);
            return;
         }

        // other tools only function if there is an active buffer/selection, ensure there is one and it is from this category
        let activeBuffer = this.props.activeBuffer;
        if (activeBuffer === undefined) {
            return;
        }

        let category = this.props.api.categoryFromResource(activeBuffer);
        if (category !== this.props.name) {
            console.log("ignoring tool, active buffer is not in category", category);
            return;
        }

        switch (name) {
        case 'duplicate':
            this.props.scriptDuplicate(this.props.activeBuffer)
            break;

        case 'remove':
            this.handleRemove(this.props.activeNode)
            break;

        case 'rename':
            this.handleRename(this.props.activeNode)
            break;

        default:
            console.log(name)
            break;
        }
    }

    handleRemove = (selection) => {
        if (selection === undefined) {
            console.log("handleRemove: selection undefined?")
            return
        }

        let removeModalCompletion = (choice) => {
            console.log('remove:', choice)
            if (choice === 'ok') {
                this.props.resourceDelete(this.props.api, selection.get("url"))
            }
            this.props.hideModal()
        }

        let scriptName = selection.get("name")
        let content = (
            <ModalContent
                message={`Delete "${scriptName}"?`}
                supporting={"This operation cannot be undone."}
                buttonAction={removeModalCompletion}
            />
        )

        this.props.showModal(content)
    }

    handleRename = (selection) => {
        if (selection === undefined) {
            console.log("handleRename: selection undefined?")
            return
        }

        let complete = (choice, name) => {
            console.log('rename:', choice, name)
            if (name && choice === "ok") {
                this.props.resourceRename(
                    this.props.api,
                    selection.get("url"),
                    name,
                    selection.get("virtual") || false
                )
            }
            this.props.hideModal()
        }

        let initialName = selection.get("name");
        let selectedResource = selection.get("url");
        let content = (
            <ModalRename message="Rename" buttonAction={complete} selectedResource={selectedResource} initialName={initialName} />
        )

        this.props.showModal(content)
    }

    handleNewFolder = (selectedResource) => {
        const category = this.getCategory();

        let complete = (choice, name) => {
            console.log('new folder:', choice, name)
            if (name && choice === "ok") {
                const newResource = siblingResourceForName(name, selectedResource, category)
                this.props.directoryCreate(
                    this.props.api,
                    newResource,
                    name,
                    category,
                )
            }
            this.props.hideModal()
        }

        let content = (
            <ModalRename message="New Folder" buttonAction={complete} selectedResource={selectedResource} category={category}/>
        )

        this.props.showModal(content)
    }

    getData() {
        let node = this.props.data.find(n => n.name === this.props.name)
        if (node) {
            return node.children;
        }
        return [];
    }

    getCategory() {
        return this.props.name;
    }

    render() {
        let data = this.getData()

        return (
            <div
                className='explorer-section'
                ref={(elem) => this.section = elem}
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
        name: "add",
        icon: ICONS["plus"],
        tooltipMessage: "new script"
    },
    {
        name: "remove",
        icon: ICONS["minus"],
        tooltipMessage: "delete script"
    },
    {
        name: "duplicate",
        icon: ICONS["copy"],
        tooltipMessage: "duplicate script"
    },
    {
        name: "new-folder",
        icon: ICONS["folder-plus"],
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: ICONS["pencil"],
        tooltipMessage: "rename file/folder"
    },
]

const audioTools = [
    {
        name: "remove",
        icon: ICONS["minus"],
        tooltipMessage: "delete audio file"
    },
    {
        name: "new-folder",
        icon: ICONS["folder-plus"],
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: ICONS["pencil"],
        tooltipMessage: "rename file/folder"
    },
]

const dataTools = [
    {
        name: "add",
        icon: ICONS["plus"],
        tooltipMessage: "new data file"
    },
    {
        name: "remove",
        icon: ICONS["minus"],
        tooltipMessage: "delete data file"
    },
    {
        name: "duplicate",
        icon: ICONS["copy"],
        tooltipMessage: "duplicate data file"
    },
    {
        name: "new-folder",
        icon: ICONS["folder-plus"],
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: ICONS["pencil"],
        tooltipMessage: "rename file/folder"
    },
]


class Explorer extends Component {
    render() {
        const {width, height} = this.props;

        return (
            <div className={'explorer' + (this.props.hidden ? ' hidden' : '')} // FIXME: change this to use classname
                style={{width, height}}
                ref={(elem) => this.explorer = elem}
            >
                <Section
                    name='scripts'
                    tools={scriptTools}
                    buttonAction={this.onToolClick}
                    data={this.props.data}
                    explorerToggleNode={this.props.explorerToggleNode}
                    bufferSelect={this.props.bufferSelect}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
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
                    name='audio'
                    tools={audioTools}
                    buttonAction={this.onToolClick}
                    data={this.props.data}
                    explorerToggleNode={this.props.explorerToggleNode}
                    bufferSelect={this.props.bufferSelect}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
                    resourceDelete={this.props.resourceDelete}
                    resourceRename={this.props.resourceRename}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    api={this.props.api}
                    activeBuffer={this.props.activeBuffer}
                    activeNode={this.props.activeNode}
                />
                <Section
                    name='data'
                    tools={dataTools}
                    buttonAction={this.onToolClick}
                    data={this.props.data}
                    explorerToggleNode={this.props.explorerToggleNode}
                    bufferSelect={this.props.bufferSelect}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
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
