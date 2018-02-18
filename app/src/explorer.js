import React, { Component } from 'react';
import { decorators, Treebeard } from 'react-treebeard';
import cx from 'classname';
import treeStyle from './explorer-style';
import treeAnim from './explorer-animation';
import './explorer.css';

const Header = (props) => {
    let className = cx('explorer-entry', {'dirty': props.node.modified}, {'active': props.node.active});
    console.log(props.node, className)
    return (
        <span className={className}>
        {props.node.name}
        </span>
    );
};

const Toggle = ({style}) => {
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
    Header,
    Toggle,
};

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
                <div className='explorer-header'>scripts</div>
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
