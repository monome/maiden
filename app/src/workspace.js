import React, { Component } from 'react';
import ActivityBar from './activity-bar';
import './workspace.css';

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityBarWidth: 50,
        };
    }

    activityBarSize() {
        return {
            width: this.state.activityBarWidth,
            height: this.props.height,
        };
    }

    activityViewSize() {
        return {
            width: this.props.width - this.state.activityBarWidth,
            height: this.props.height,
        };
    }

    handleActivitySelection = (name) => {
        if (name === this.props.selected) {
            this.props.sidebarToggle()
        }
        else {
            this.props.activitySelect(name)
        }
    }

    render() {
        const selectedActivity = this.props.activities.find(a => {
            return this.props.selected === a.selector
        });
        const ActivityView = selectedActivity.view;

        return (
            <div className="workspace">
                <ActivityBar
                    style={this.activityBarSize()}
                    selected={this.props.selected}
                    activities={this.props.activities}
                    buttonAction={this.handleActivitySelection} />
                <ActivityView
                    {...this.activityViewSize()}
                    api={this.props.api}
                />
            </div>
        )
    }
}

export default Workspace;