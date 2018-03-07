import React, { Component } from 'react';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import './activity-bar.css'

class ActivityBar extends Component {
    render() {
        const items = this.props.activities.map(activity => {
            return (
                <IconButton
                    key={activity.selector + activity.toggle}
                    action={() => this.props.buttonAction(activity)}
                    icon={activity.icon}
                    color="#979797"   // FIXME: this should be styled
                    size="24"       // FIXME: this should be configurable?
                />
            );
        });

        return (
            <ToolBar style={this.props.style}>
                {items}
            </ToolBar>
        );
    }
}

export default ActivityBar;