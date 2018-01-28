import React from 'react';
import './tool-bar.css';

const ToolBar = (props) => {
    /*
    const spacer = {
        paddingTop: 8,
        paddingBottom: 8,
        // paddingLeft: 10,
        // paddingRight: 10,
    }

    const elements = props.children.map(c => 
        <div style={spacer}>{c}</div>
    );
    */
    
    return (
        <div className="tool-bar" style={props.style}>
            <div className="tool-bar-container">
                {props.children}
            </div>
        </div>
    );
};

export default ToolBar;