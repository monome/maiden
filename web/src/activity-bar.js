import React, { Component } from 'react';
import Popup from 'reactjs-popup';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import './activity-bar.css';

class ActivityBar extends Component {
  render() {
    const upperItems = [];
    const lowerItems = [];

    this.props.activities.forEach(activity => {
      let button = (
        <IconButton
          key={activity.selector + activity.toggle}
          action={() => this.props.buttonAction(activity)}
          tooltipMessage={activity.tooltipMessage}
          tooltipPosition={activity.tooltipPosition}
          icon={activity.icon}
          color="hsl(0, 0%, 59%)"
          size="24"
        />
      );

      if (activity.popup) {
        const trigger = (
          <div className="activity-bar-doc-menu">?</div>
        );
        const contentStyle = {
          fontFamily: 'monospace',
          backgroundColor: '#F4F4F4',
          padding: '6px',
          opacity: '40%',
          borderStyle: 'none',
          boxShadow: 'none',
          paddingLeft: '.4em',
        };

        button = (
          <Popup 
            trigger={trigger}
            on='hover'
            contentStyle={contentStyle}
            closeOnDocumentClick
            mouseLeaveDelay={180}
            mouseEnterDelay={0}
            position='right center'
            arrow={false}>
              <div><a href="https://monome.org/docs/norns/" target="_blank" rel="noopener noreferrer">overview</a></div>
              <div><a href="/doc" target="_blank" rel="noopener noreferrer">api</a></div>
          </Popup>
        );
      }

      if (activity.position && activity.position === 'lower') {
        lowerItems.push(button);
      } else {
        upperItems.push(button);
      }
    });

    return (
      <ToolBar style={this.props.style} lowerChildren={lowerItems}>
        {upperItems}
      </ToolBar>
    );
  }
}

export default ActivityBar;
