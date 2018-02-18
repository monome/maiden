import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import cx from 'classname';
import treeStyle from './explorer-style';
import treeAnim from './explorer-animation';
import './explorer.css';

const TreeHeader = (props) => {
    let className = cx('explorer-entry', 'noselect', {'dirty': props.node.modified}, {'active': props.node.active});
    // console.log(props.node, className)
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
        <span style={style.base}>
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

const SectionHeader = (props) => {
    return (
        <div className='explorer-header'>
            <span className='section-name'>{props.name}</span>
            {/* <span className='section-tools'>tools</span> */}
        </div>
    );
}

class Explorer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    onToggle = (node, toggled) => {
        if (node.children) {
            this.props.explorerToggleNode(node, toggled)
            if (toggled) {
                this.props.scriptDirRead(this.props.api, node.url);
            }
        } else {
            this.props.scriptSelect(node.url);
        }
    }

    render() {
        const {width, height} = this.props;
        return (
            <div className={'explorer' + (this.props.hidden ? ' hidden' : '')}
                 style={{width, height}}>
                <SectionHeader name='scripts' />
                <Treebeard
                    style={treeStyle}
                    animations={treeAnim}
                    data={this.props.data}
                    onToggle={this.onToggle}
                    decorators={explorerDecorators}
                />
            </div>
        );
    }
}

export default Explorer;
