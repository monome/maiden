import React, { Component } from 'react';
import './text-button.css';

const hslRegex = /hsl\((\d{1,3}),\s?(\d{1,3})%,\s?(\d{1,3})%\)/;

class TextButton extends Component {
  static defaultProps = {
    dark: true,
  };

  constructor (props) {
    super(props)
    
    // Parse the hsl values from props.color
    const [, h, s, l] = this.props.color.match(hslRegex);
    this.parsedColor = { h, s, l };

    this.state = {
      color: this.color,
    };
  }
  
  get color() {
    return this.props.disabled ? this.disabledColor : this.props.color;
  }

  // For the disabled color, we'll add 10% to the lightness
  get disabledColor() {
    const { h, s, l } = this.parsedColor;
    return `hsl(${h}, ${s}%, ${Math.min(100, +l + 20)}%)`;
  }

  // For hover color, we'll determine whether to
  // darken or lighten based on the props.dark
  get hoverColor() {
    const { h, s, l } = this.parsedColor;
    if (this.props.dark) {
      return `hsl(${h}, ${s}%, ${Math.max(0, +l - 20)}%)`;
    }
    return `hsl(${h}, ${s}%, ${Math.min(100, +l + 20)}%)`;
  }

  handleMouseEnter = () => {
    // Only apply the hover styles if the button is active
    if (!this.props.disabled) {
      this.setState(() => ({
        color: this.hoverColor,
      }));
    }
  };

  handleMouseLeave = () => {
    // Only update the state when necessary
    if (this.state.color !== this.color) {
      this.setState(() => ({
        color: this.color,
      }));
    }
  };

  handleClick = () => {
    if (!this.props.disabled) {
      this.props.action();
    }
  };
  
  render() {
    const style = {color: this.state.color};
    return (
      <button className='text-button'
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        disabled={this.props.disabled}
        style={style}
      >
        {this.props.children}
      </button>
    );
  };
};

export default TextButton;