import React, { Component } from 'react';
import Icon from './icon';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

class IconButton extends Component {
    handleClick = () => {
        if (!this.props.disabled) {
            this.props.action()
        }
    }

    getColor = () => {
        if (this.props.disabledColor && this.props.disabled) {
            return this.props.disabledColor;
        }
        return this.props.color;
    }

    render() {
        let style = { padding: this.props.padding || 6 };
        let color = this.getColor();

        return (
            <button
                className="icon-button"
                onClick={this.handleClick}
                style={style}
            >
                <Icon icon={this.props.icon} size={this.props.size} color={color}/>
            </button>
        );
    }
};

export default IconButton;