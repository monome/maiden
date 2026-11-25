import React from 'react';
import cx from 'classname';
import './badge.css';

const Badge = props => {
  const className = cx('badge', { 'badge-selected': props.selected });
  if (props.action) {
    return (
      <button className={cx(className, 'badge-button')} onClick={props.action}>
        {props.children}
      </button>
    );
  }
  return <span className={className}>{props.children}</span>;
};

export default Badge;
