import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import treeStyle from './explorer-style';
import './explorer.css';


const explorerDecorators = {
    ...decorators,
    Header: (props) => {
        let className = 'explorer-entry' + (props.node.modified ? ' dirty' : '');
        return (
            <div className={className} style={props.style}>
            {props.node.name}
            </div>
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
        if (this.state.cursor) {
            // FIXME: use setState
            this.state.cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
            if (toggled) {
                this.props.scriptDirRead(this.props.api, node.url);
            }
        } else {
            this.props.scriptSelect(node.url);
        }
        this.setState({ cursor: node });
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
