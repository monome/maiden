import React, { Component } from 'react';
import './activity-item.css'

// this should probably be the class for a single activity button
class ActivityItem extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        //
        // inform the workspace
        this.props.onActivityClicked(this.props.activity.key)
        console.log('click on:', this);
    }

    render() {
        return (
            <li key={this.props.activity.key}>
                <button onClick={this.handleClick}>
                    {this.props.activity.name}
                </button>
            </li>
        );
    }
}

export default ActivityItem;