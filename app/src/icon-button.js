import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import Icon from './icon';
import './icon-button.css';

// TODO:
//  * add hover style
//  * add selected style

class IconButton extends Component {
    handleClick = () => {
      if (!this.props.disabled) {
        this.props.action();
      }
    }

    getColor = () => {
      if (this.props.disabledColor && this.props.disabled) {
        return this.props.disabledColor;
      }
      return this.props.color;
    }

    render() {
      const style = { padding: this.props.padding || 6 };
      const color = this.getColor();
      const tooltipPosition = this.props.tooltipPosition || 'bottom';

      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
      }

      const uniqueId = guid();

      return (
        <button
          className="icon-button"
          onClick={this.handleClick}
          data-tip={this.props.tooltipMessage}
          data-place={this.props.tooltipMessage && tooltipPosition}
          data-for={this.props.tooltipMessage && uniqueId}
          style={style}
        >
          <Icon icon={this.props.icon} size={this.props.size} color={color} />
          {this.props.tooltipMessage && <ReactTooltip id={uniqueId} effect="solid" delayShow={1000} delayHide={500} className="customTooltip" />}
        </button>
      );
    }
}

export default IconButton;
