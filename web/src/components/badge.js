import React from 'react';
import './badge.css';

const Badge = (props) => {
  return (
    <span className='badge'>
      {props.children}
    </span>
  );
}

export default Badge;
