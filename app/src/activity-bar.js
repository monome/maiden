import React, { Component } from 'react';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import './activity-bar.css';

class ActivityBar extends Component {
  render() {
    const upperItems = [];
    const lowerItems = [];

    this.props.activities.forEach((activity) => {
      const button = (
        <IconButton
          key={activity.selector + activity.toggle}
          action={() => this.props.buttonAction(activity)}
          tooltipMessage={activity.tooltipMessage}
          tooltipPosition={activity.tooltipPosition}
          icon={activity.icon}
          color="#eeeeee" // FIXME: this should be styled
          size="24"
        />
      );
      if (activity.position && activity.position === 'lower') {
        lowerItems.push(button);
      } else {
        upperItems.push(button);
      }
    });

    return (
      <ToolBar
        style={this.props.style}
        lowerChildren={lowerItems}
      >
        {upperItems}
      </ToolBar>
    );
  }
}

export default ActivityBar;
