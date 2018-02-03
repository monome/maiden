import React, { Component } from 'react';
import ToolBar from './tool-bar';
import IconButton from './icon-button';
import './activity-bar.css'

class ActivityBar extends Component {
    render() {
        const items = this.props.activities.map(activity => {
            const name = activity.selector;
            const icon = activity.icon;
            return (
                <IconButton
                    key={name}
                    action={() => this.props.buttonAction(name)}
                    icon={icon}
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