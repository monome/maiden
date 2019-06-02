import React from 'react';
import cx from 'classname';
import './switcher.css';

const Tab = props => {
  const className = cx(
    'switcher-tab',
    { noselect: true },
    {'switcher-active-tab': props.isActive },
  );

  return (
    <button
      className={className}
      key={props.name}
      onClick={props.onClick}
    >
      {props.name}
    </button>
  );
};

const Switcher = props => {
  const { activeTab, children } = props;

  console.log('children', children);

  const tabs = children.map(c => (
    <Tab
      name={c.props.name}
      isActive={c.props.name === activeTab}
      key={c.props.name}
      onClick={props.select(c.props.name)}
    />
  ));

  const which = children.find(c => (
    c.props.name === activeTab
  ));

  console.log('which', which);
  
  return (
    <div>
      <div className="switcher-tab-container">
        {tabs}
      </div>
      <div className="switcher-content-container">
        {which}
      </div>
    </div>
  );
};

export default Switcher;