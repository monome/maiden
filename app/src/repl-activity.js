import React, { Component } from 'react';
import Repl from './repl';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';

import './repl-activity.css';

const tools = [
    {
        name: "clear",
        icon: ICONS['file-empty'], // FIXME: temp
    }
];

// TODO: refactor this and EditTools into a common function
const ReplTools = (props) => {
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


class ReplActivity extends Component {
    TOOLBAR_WIDTH = 50;

    handleToolInvoke = (name) => {
        console.log("invoke(): ", name);
    }

    replSize() {
        return {
            width: this.props.width - this.TOOLBAR_WIDTH,
            height: this.props.height,
        }
    }

    toolsSize() {
        return {
            width: this.TOOLBAR_WIDTH,
            height: this.props.height,
        };
    }
    
    render() {
        return (
            <div className="repl-activity">
                <Repl 
                    className="repl-container"
                    {...this.replSize()}
                />
                <ReplTools
                    className="repl-tools"
                    {...this.toolsSize()}
                    tools={tools}
                    buttonAction={this.handleToolInvoke}
                />
            </div>
        );
    }
};

export default ReplActivity;