// import React, { Component } from 'react';
import React from 'react';
import { VERSION, COMMIT } from './version';

import './configure-activity.css';

const ConfigureActivity = (props) => {
    let style = {
        height: props.height,
        width: props.width,
    };

    return (
        <div className="configure-activity" style={style}>
            <div className="configure-about">
                <span>version: {VERSION} ({COMMIT})</span>
            </div>
            <div className="configure-tbd">
                <span>tbd...</span>
            </div>
        </div>
    );
};

export default ConfigureActivity;