import React, { Component } from 'react';
import { Tooltip } from 'react-tooltip';
import Icon from './icon';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

const hslRegex = /hsl\((\d{1,3}),\s?(\d{1,3})%,\s?(\d{1,3})%\)/;

class IconButton extends Component {
  static defaultProps = {
    darkenOnHover: true,
  };

  constructor(props) {
    super(props);

    // Parse the hsl values from props.color
    const [, h, s, l] = this.props.color.match(hslRegex);
    this.parsedColor = { h, s, l };

    // Stable id so hover re-renders (color change) do not break react-tooltip v5
    this.tooltipId = `icon-button-${Math.random()
      .toString(36)
      .slice(2, 11)}`;

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
    return `hsl(${h}, ${s}%, ${Math.min(100, +l + 20)}%)`;
  }

  // For hover color, we'll determine whether to
  // darken or lighten based on the props.darkenOnHover
  get hoverColor() {
    const { h, s, l } = this.parsedColor;
    if (this.props.darkenOnHover) {
      return `hsl(${h}, ${s}%, ${Math.max(0, +l - 30)}%)`;
    }
    return `hsl(${h}, ${s}%, ${Math.min(100, +l + 30)}%)`;
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
    const style = { padding: this.props.padding || 6 };
    const tooltipPosition = this.props.tooltipPosition || 'bottom';
    const { tooltipMessage } = this.props;

    // Keep Tooltip outside <button>: a tooltip <div> inside a button is invalid
    // HTML and breaks react-tooltip v5 show/hide. display:contents preserves
    // toolbar flex layout so the button remains the flex item.
    return (
      <span style={{ display: 'contents' }}>
        <button
          className="icon-button"
          onClick={this.handleClick}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          data-tooltip-content={tooltipMessage}
          data-tooltip-place={tooltipMessage ? tooltipPosition : undefined}
          data-tooltip-id={tooltipMessage ? this.tooltipId : undefined}
          style={style}
          disabled={this.props.disabled}
        >
          <Icon icon={this.props.icon} size={this.props.size} color={this.state.color} />
        </button>
        {tooltipMessage && (
          <Tooltip
            id={this.tooltipId}
            place={tooltipPosition}
            delayShow={1000}
            delayHide={500}
            className="customTooltip"
            positionStrategy="fixed"
            openEvents={{ mouseenter: true, focus: true }}
            closeEvents={{ mouseleave: true, blur: true }}
          />
        )}
      </span>
    );
  }
}

export default IconButton;
