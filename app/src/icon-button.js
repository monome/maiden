import React, { Component } from 'react';
import Icon from './icon';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

class IconButton extends Component {
    render() {
        return (
            <button className="icon-button" onClick={() => this.props.action()}>
                <Icon icon={this.props.icon} size={this.props.size} />
            </button>
        );
    }
};

export default IconButton;