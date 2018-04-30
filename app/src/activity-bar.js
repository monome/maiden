import React, { Component } from 'react';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import './activity-bar.css'

class ActivityBar extends Component {
    render() {
        let upperItems = [];
        let lowerItems = [];

        this.props.activities.forEach(activity => {
            let button = (
                <IconButton
                    key={activity.selector + activity.toggle}
                    action={() => this.props.buttonAction(activity)}
                    icon={activity.icon}
                    color="#979797"   // FIXME: this should be styled
                    size="24"       // FIXME: this should be configurable?
                />
            );
            if (activity.position && activity.position === "lower") {
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