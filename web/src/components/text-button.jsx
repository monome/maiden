import React, { Component } from 'react';
import './text-button.css';

class TextButton extends Component {
  handleClick = () => {
    if (!this.props.disabled) {
      this.props.action();
    }
  };

  render() {
    return (
      <button
        className={`text-button ${this.props.classes ? ` ${this.props.classes}` : ''}`}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </button>
    );
  }
}

export default TextButton;
