import React, { Component } from 'react';
import Icon from './icon';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

class IconButton extends Component {
    render() {
        let style = { padding: this.props.padding || 6 };
        return (
            <button 
                className="icon-button" 
                onClick={() => this.props.action()}
                style={style}
            >
                <Icon icon={this.props.icon} size={this.props.size} color={this.props.color}/>
            </button>
        );
    }
};

export default IconButton;