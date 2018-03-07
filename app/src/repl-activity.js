import React, { Component } from 'react';
import cx from 'classname';
import Repl from './repl';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';

import './repl-activity.css';

const tools = [
    {
        name: "clear",
        icon: ICONS['forbidden'], // FIXME: temp
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

// TODO: refactor this into a generic message/action widget
const ReplConnect = (props) => {
    let { height, width } = props;
    let style = { height, width };

    return (
        <div className="repl-connect-container" style={style}>
            <div className="repl-connect-content">
                <span className="message">Not connected to </span>
                <span className="component">{props.activeRepl}</span>
                <IconButton
                    action={() => props.connectAction(props.activeRepl)}
                    icon={ICONS['loop2']}
                    color="#979797"       // FIXME:
                    size="24"           // FIXME:
                />
            </div>
        </div>
    )
}


class ReplActivity extends Component {
    TOOLBAR_WIDTH = 50;

    handleToolInvoke = (name) => {
        if (name === 'clear') {
            this.props.replClear(this.props.activeRepl)
        }
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

    handleConnect = (component) => {
        let endpoint = this.props.endpoints.get(component)
        this.props.replConnect(component, endpoint)
    }

    render() {
        let { activeRepl, buffers, history } = this.props;

        var replView;
        if (this.props.isConnected(activeRepl)) {
            replView = <Repl
                            className="repl-container"
                            {...this.replSize()}
                            activeRepl={activeRepl}
                            buffers={buffers}
                            history={history}
                            replSend={this.props.replSend}
                        />
        } else {
            replView = <ReplConnect
                            {...this.replSize()}
                            activeRepl={activeRepl}
                            connectAction={this.handleConnect}
                        />
        }

        let containerClassName = cx("repl-activity-container", {"hidden": this.props.hidden},);

        return (
            <div className={containerClassName}>
                <div className="repl-activity">
                    {replView}
                    <ReplTools
                        className="repl-tools"
                        {...this.toolsSize()}
                        tools={tools}
                        buttonAction={this.handleToolInvoke}
                    />
                </div>
            </div>
        );
    }
};

export default ReplActivity;