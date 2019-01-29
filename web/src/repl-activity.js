import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import cx from 'classname';
import Repl from './repl';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';

import './repl-activity.css';

const tools = [
  {
    name: 'clear',
    tooltipMessage: 'clear',
    tooltipPosition: 'left',
    icon: ICONS.forbidden, // FIXME: temp
  },
];

// TODO: refactor this and EditTools into a common function
const ReplTools = props => {
  const items = props.tools.map(tool => (
    <IconButton
      key={tool.name}
      tooltipMessage={tool.tooltipMessage}
      tooltipPosition={tool.tooltipPosition}
      action={() => props.buttonAction(tool.name)}
      icon={tool.icon}
      color="hsl(0, 0%, 59%)"
      size="24" // FIXME:
    />
  ));

  const style = { width: props.width, height: props.height };
  return <ToolBar style={style}>{items}</ToolBar>;
};

// TODO: refactor this into a generic message/action widget
const ReplConnect = props => {
  const { height, width } = props;
  const style = { height, width };

  return (
    <div className="repl-connect-container" style={style}>
      <div className="repl-connect-content">
        <span className="message">Not connected to </span>
        <span className="component">{props.activeRepl}</span>
        <IconButton
          action={() => props.connectAction(props.activeRepl)}
          tooltipMessage="refresh connection"
          tooltipPosition="top"
          icon={ICONS.loop2}
          color="hsl(0, 0%, 59%)"
          size="24" // FIXME:
        />
      </div>
    </div>
  );
};

const ReplSwitcherTab = props => {
  const className = cx(
    'repl-switcher-tab',
    { noselect: true },
    { 'repl-active-tab': props.isActive },
  );
  const tooltipMessage = `show ${props.name} repl`;
  return (
    <div>
      <button
        className={className}
        key={props.name}
        onClick={props.onClick}
        data-tip={tooltipMessage}
        data-for={props.name}
      >
        {props.name}
      </button>
      <ReactTooltip
        id={props.name}
        effect="solid"
        className="customTooltip"
        delayShow={1000}
        delayHide={500}
        place="top"
      />
    </div>
  );
};

const ReplSwitcher = props => {
  const { activeRepl, height, width } = props;

  const switcherSize = {
    width,
    height: 30,
  };

  const tabs = props.endpoints.keySeq().map(k => {
    const isActive = props.activeRepl === k;
    return (
      <ReplSwitcherTab
        name={k}
        isActive={isActive}
        key={k}
        onClick={() => {
          props.replSelect(k);
        }}
      />
    );
  });

  const contentSize = {
    width,
    height: height - switcherSize.height,
  };

  return (
    <div>
      <div className="repl-switcher-tabs" style={switcherSize}>
        {tabs}
      </div>
      <Repl
        className="repl-container"
        {...contentSize}
        activeRepl={activeRepl}
        buffers={props.buffers}
        history={props.history}
        replSend={props.replInput}
        renderChild={!props.isConnected(activeRepl)}
      >
        <ReplConnect {...contentSize} activeRepl={activeRepl} connectAction={props.handleConnect} />
      </Repl>

    </div>
  );
};

class ReplActivity extends Component {
  TOOLBAR_WIDTH = 50;

  componentWillMount() {
    // get the unit mapping so that the unit commands know what to do
    this.props.unitMapping();
  }

  handleToolInvoke = name => {
    if (name === 'clear') {
      this.props.replClear(this.props.activeRepl);
    }
  };

  replSize() {
    return {
      width: this.props.width - this.TOOLBAR_WIDTH - 1,
      height: this.props.height,
    };
  }

  toolsSize() {
    return {
      width: this.TOOLBAR_WIDTH,
      height: this.props.height,
    };
  }

  handleConnect = component => {
    const endpoint = this.props.endpoints.get(component);
    this.props.replConnect(component, endpoint);
  };

  render() {
    const containerClassName = cx('repl-activity-container', { hidden: this.props.hidden });

    return (
      <div className={containerClassName}>
        <div className="repl-activity">
          <ReplSwitcher {...this.props} {...this.replSize()} handleConnect={this.handleConnect} />
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
}

export default ReplActivity;
