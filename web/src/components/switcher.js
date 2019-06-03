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
  const { activeTab, children, size } = props;

  const tabContinerHeight = { height: 30 };
  const childContentSize = {
    height: size.height - tabContinerHeight.height,
    width: size.width,
  };

  //console.log('children', children);

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

  //console.log('which', which);
  
  
  return (
    <div>
      <div className="switcher-tab-container" style={tabContinerHeight}>
        {tabs}
      </div>
      <div className="switcher-content-container" style={childContentSize}>
        {which}
      </div>
    </div>
  );
};

export default Switcher;