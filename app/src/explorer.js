import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import cx from 'classname';

import treeStyle from './explorer-style';
import treeAnim from './explorer-animation';
import './explorer.css';

import ModalContent from './modal-content';
import ModalGetName from './modal-get-name';

import IconButton from './icon-button';
import { NewFileIcon, DeleteIcon, DuplicateIcon, NewFolderIcon, RenameIcon } from './icons';

import { DUST_SCRIPT_PATH, DUST_LUA_LIB_PATH, DUST_AUDIO_PATH, DUST_DATA_PATH } from './constants';
import api from './api';


const TreeHeader = (props) => {
    const className = cx(
        'explorer-entry',
        'noselect',
        {'dirty': props.node.modified},
        {'active-buffer': props.node.activeBuffer},
        {'active-selection': props.node.activeNode && !props.node.activeBuffer},
    );
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
    let buttons = undefined;
    if (props.showTools) {
        buttons = props.tools.map(tool => {
            return (
                <IconButton
                    key={tool.name}
                    tooltipMessage={tool.tooltipMessage}
                    tooltipPosition={tool.tooltipPosition}
                    action={() => props.buttonAction(tool.name)}
                    icon={tool.icon}
                    size="24"
                    padding="0.4px"
                    color="#e4e4e4"
                />
            );
        });
    }

    const handleDoubleClick = (event) => {
        if (props.headerDoubleClickAction) {
            props.headerDoubleClickAction(event);
        }
    };

    return (

        <div className='explorer-header' onDoubleClick={handleDoubleClick}>
            <span className='section-name'>{props.name}</span>
            <span
                className={cx('section-tools', {'opaque': props.showTools})}
            >
                {buttons}
            </span>
        </div>
    );
}

class Section extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showTools: false,
            selectedNode: undefined,  // TODO: get rid of this
        };
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

    isCollapsed = () => {
        return this.props.collapsedCategories.has(this.getCategory());
    }

    onToggle = (node, toggled) => {
        if (node.children) {
            this.props.explorerToggleNode(node, toggled)
            if (toggled) {
                this.props.directoryRead(node.url);
            }
        } else {
            this.props.bufferSelect(node.url);
        }
        this.props.explorerActiveNode(node)
        this.setState({ selectedNode: node });
    }

    onHeaderToggle = event => {
        this.props.explorerToggleCategory(this.getCategory());
    }

    onToolClick = (name) => {
        console.log("activeNode: ", this.props.activeNode ? this.props.activeNode.toJS() : undefined);
        let selectedResource = this.props.activeNode ? this.props.activeNode.get('url') : undefined;

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
            // FIXME: switch this to using this.props.activeNode
            this.handleNewFolder(this.state.selectedNode);
            return;
         }

        // other tools only function if there is an active buffer/selection, ensure there is one and it is from this category
        
        if (this.props.activeNode === undefined) {
            return;
        }

        let activeResource = this.props.activeNode.get('url');
        let activeResourceIsDir = this.props.activeNode.has('children');

        if (!activeResource.includes(this.props.dataRootPath)) {
            console.log("ignoring tool, active buffer is not in category", this.props.dataRootPath);
            return;
        }

        switch (name) {
        case 'duplicate':
            if (activeResourceIsDir) {
                console.log("duplicate directory not implemented");
            } else {
                this.props.scriptDuplicate(activeResource);
            }
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
                this.props.resourceDelete(selection.get("url"))
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
            <ModalGetName message="Rename" buttonAction={complete} selectedResource={selectedResource} initialName={initialName} />
        )

        this.props.showModal(content)
    }

    handleNewFolder = (selectedNode) => {
        // if no selected node, validate/create against root names
        // if selected node is file, validate/create against siblings name
        // if selected node is dir, validate/create against *children* of dir
        if (!selectedNode) {
            selectedNode = this.getNode();
        }
        const selectedResource = selectedNode.url;
        const category = this.getCategory();

        const selectionIsDir = 'children' in selectedNode;

        let complete = (choice, name) => {
            console.log('new folder:', choice, name)
            if (name && choice === "ok") {
                const newResource = selectionIsDir ? api.childResourceForName(name, selectedResource) : api.siblingResourceForName(name, selectedResource, category);
                this.props.directoryCreate(
                    newResource,
                    name,
                    category,
                );
            }
            this.props.hideModal();
        };

        let message = 'New Folder';
        if (selectionIsDir) {
            message +=  ` (${selectedNode.name})`;
        }

        let content = (
            <ModalGetName message={message} buttonAction={complete} selectedResource={selectedResource} category={category}/>
        );

        this.props.showModal(content);
    }

    getData() {
        const node = this.getNode();
        if (node) {
            return node.children;
        }
        return [];
    }

    getNode() {
        const category = this.getCategory();
        return this.props.data.find(n => n.name === category)
    }

    getCategory() {
        return this.props.dataRootPath;
    }

    render() {
        const data = this.getData();
        const isCollapsed = this.isCollapsed();
        
        let tree = undefined;
        if (!isCollapsed) {
            tree = (
                <Treebeard
                    style={treeStyle}
                    animations={treeAnim}
                    data={data}
                    onToggle={this.onToggle}
                    decorators={explorerDecorators}
                />
            );
        }

        return (
            <div
                className='explorer-section'
                ref={(elem) => this.section = elem}
            >
                <SectionHeader
                    name={this.props.name}
                    tools={this.props.tools}
                    buttonAction={this.onToolClick}
                    headerDoubleClickAction={this.onHeaderToggle}
                    showTools={!isCollapsed && this.state.showTools}
                />
                {tree}
            </div>
        );
    }
}

const scriptTools = [
    {
        name: "add",
        icon: NewFileIcon,
        tooltipMessage: "new script"
    },
    {
        name: "remove",
        icon: DeleteIcon,
        tooltipMessage: "delete script"
    },
    {
        name: "duplicate",
        icon: DuplicateIcon,
        tooltipMessage: "duplicate script"
    },
    {
        name: "new-folder",
        icon: NewFolderIcon,
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: RenameIcon,
        tooltipMessage: "rename file/folder"
    },
]

const audioTools = [
    {
        name: "remove",
        icon: DeleteIcon,
        tooltipMessage: "delete audio file"
    },
    {
        name: "new-folder",
        icon: NewFolderIcon,
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: RenameIcon,
        tooltipMessage: "rename file/folder"
    },
]

const dataTools = [
    {
        name: "add",
        icon: NewFileIcon,
        tooltipMessage: "new data file"
    },
    {
        name: "remove",
        icon: DeleteIcon,
        tooltipMessage: "delete data file"
    },
    {
        name: "duplicate",
        icon: DuplicateIcon,
        tooltipMessage: "duplicate data file"
    },
    {
        name: "new-folder",
        icon: NewFolderIcon,
        tooltipMessage: "new folder"
    },
    {
        name: "rename",
        icon: RenameIcon,
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
                    dataRootPath={DUST_SCRIPT_PATH}
                    data={this.props.data}
                    tools={scriptTools}
                    buttonAction={this.onToolClick}
                    collapsedCategories={this.props.collapsedCategories}
                    explorerToggleCategory={this.props.explorerToggleCategory}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    bufferSelect={this.props.bufferSelect}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    resourceDelete={this.props.resourceDelete}
                    resourceRename={this.props.resourceRename}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    activeBuffer={this.props.activeBuffer}
                    activeNode={this.props.activeNode}
                />
                <Section
                    name='lib'
                    dataRootPath={DUST_LUA_LIB_PATH}
                    data={this.props.data}
                    tools={scriptTools}
                    buttonAction={this.onToolClick}
                    collapsedCategories={this.props.collapsedCategories}
                    explorerToggleCategory={this.props.explorerToggleCategory}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    bufferSelect={this.props.bufferSelect}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    resourceDelete={this.props.resourceDelete}
                    resourceRename={this.props.resourceRename}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    activeBuffer={this.props.activeBuffer}
                    activeNode={this.props.activeNode}
                />
                <Section
                    name='audio'
                    dataRootPath={DUST_AUDIO_PATH}
                    data={this.props.data}
                    tools={audioTools}
                    buttonAction={this.onToolClick}
                    collapsedCategories={this.props.collapsedCategories}
                    explorerToggleCategory={this.props.explorerToggleCategory}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    bufferSelect={this.props.bufferSelect}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
                    resourceDelete={this.props.resourceDelete}
                    resourceRename={this.props.resourceRename}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    activeBuffer={this.props.activeBuffer}
                    activeNode={this.props.activeNode}
                />
                <Section
                    name='data'
                    dataRootPath={DUST_DATA_PATH}
                    data={this.props.data}
                    tools={dataTools}
                    buttonAction={this.onToolClick}
                    collapsedCategories={this.props.collapsedCategories}
                    explorerToggleCategory={this.props.explorerToggleCategory}
                    explorerToggleNode={this.props.explorerToggleNode}
                    explorerActiveNode={this.props.explorerActiveNode}
                    bufferSelect={this.props.bufferSelect}
                    scriptCreate={this.props.scriptCreate}
                    scriptDuplicate={this.props.scriptDuplicate}
                    directoryRead={this.props.directoryRead}
                    directoryCreate={this.props.directoryCreate}
                    resourceDelete={this.props.resourceDelete}
                    resourceRename={this.props.resourceRename}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    activeBuffer={this.props.activeBuffer}
                    activeNode={this.props.activeNode}
                />
            </div>
        );
    }
}

export default Explorer;
