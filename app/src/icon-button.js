import React, { Component } from 'react';
import Icon from './icon';
import ReactTooltip from 'react-tooltip';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

const hslRegex = /hsl\((\d{1,3}),\s?(\d{1,3})%,\s?(\d{1,3})%\)/;

class IconButton extends Component {
    static defaultProps = {
        dark: true
    }

    constructor(props) {
        super(props);

        // Parse the hsl values from props.color
        const [ , h, s, l ] = this.props.color.match(hslRegex);
        this.parsedColor = { h, s, l };

        this.state = {
            color: this.color,
        };
    }

    // The default color for the icon
    get color() {
        return this.props.disabled ? this.disabledColor : this.props.color;
    }

    // For the disabled color, we'll add 10% to the lightness 
    get disabledColor() {
        const { h, s, l } = this.parsedColor;
        return `hsl(${h}, ${s}%, ${Math.min(100, +l + 10)}%)`;
    }

    // For hover color, we'll determine whether to
    // darken or lighten based on the props.dark
    get hoverColor() {
        const { h, s, l } = this.parsedColor;
        if (this.props.dark) {
            return `hsl(${h}, ${s}%, ${Math.max(0, +l - 10)}%)`;
        } else {
            return `hsl(${h}, ${s}%, ${Math.min(100, +l + 10)}%)`;
        }
    }

    handleMouseEnter = () => {
        // Only apply the hover styles if the button is active
        if (!this.props.disabled) {
            this.setState((prevState, props) => ({
                color: this.hoverColor,
            }));
        }
    }

    handleMouseLeave = () => {
        // Only update the state when necessary
        if (this.state.color !== this.color) {
            this.setState(() => ({
                color: this.color,
            }));
        }
    }

    handleClick = () => {
        if (!this.props.disabled) {
            this.props.action();
        }
    }

    render() {
        let style = { padding: this.props.padding || 6 };
        let tooltipPosition = this.props.tooltipPosition || "bottom";
        
        function guid() {
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        
        let uniqueId = guid();

        return (
            <button
                className="icon-button"
                onClick={this.handleClick}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                data-tip={this.props.tooltipMessage}
                data-place={this.props.tooltipMessage && tooltipPosition}
                data-for={this.props.tooltipMessage && uniqueId}
                style={style}
                disabled={this.props.disabled}
            >
                <Icon icon={this.props.icon} size={this.props.size} color={this.state.color} />
                {this.props.tooltipMessage && <ReactTooltip id={uniqueId} effect="solid" delayShow={1000} delayHide={500} className="customTooltip"></ReactTooltip>}
            </button>
        );
    }
};

export default IconButton;