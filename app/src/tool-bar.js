import React from 'react';
import './tool-bar.css';

const ToolBar = (props) => {
    return (
        <div className="tool-bar" style={props.style}>
            <div className="tool-bar-container">
                {props.children}
            </div>
        </div>
    );
};

export default ToolBar;