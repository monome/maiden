import React from 'react';
import './tool-bar.css';

const ToolBar = props => (
  <div className="tool-bar" style={props.style}>
    <div className="tool-bar-upper">
      {props.children}
    </div>
    <div className="tool-bar-lower">
      {props.lowerChildren}
    </div>
  </div>
);

export default ToolBar;
