import React, { Component } from 'react';
import ActivityItem from './activity-item';
import './activity-bar.css'

class ActivityBar extends Component {
    render() {
        const items = this.props.activities.map((activity) =>
            <ActivityItem
                activity={activity}
                isActive={this.props.isActive}
                onActivityClicked={this.props.onActivityClicked} />
        );
        return (
            <ul className="activity-bar">
                {items}
            </ul>
        );
    }
}

export default ActivityBar;