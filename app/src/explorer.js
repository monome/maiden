import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import cx from 'classname';
import treeStyle from './explorer-style';
import './explorer.css';


const explorerDecorators = {
    ...decorators,
    Header: (props) => {
        let className = cx('explorer-entry', {'dirty': props.node.modified});
        return (
            <span className={className} style={props.style}>
            {props.node.name}
            </span>
        );
    },
};

class Explorer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onToggle = (node, toggled) => {
        console.log(node);
        // if (this.state.cursor) {
            // FIXME: use setState
            // this.state.cursor.active = false;
        // }
        // node.active = true;
        if (node.children) {
            // if (toggled !== node.toggled) {
                this.props.explorerToggleNode(node, toggled)
            // }
            // node.toggled = toggled;
            if (toggled) {
                this.props.scriptDirRead(this.props.api, node.url);
            }
        } else {
            this.props.scriptSelect(node.url);
        }
        // this.setState({ cursor: node });
    }

    render() {
        const {width, height} = this.props;
        return (
            <div className={'explorer' + (this.props.hidden ? ' hidden' : '')}
                 style={{width, height}}>
                <div className='explorer-header'>scripts</div>
                <Treebeard
                    style={treeStyle}
                    data={this.props.data}
                    onToggle={this.onToggle}
                    decorators={explorerDecorators} 
                />
            </div>
        );
    }
}

export default Explorer;
