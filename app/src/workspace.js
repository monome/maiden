import React, { Component } from 'react';
import ActivityBar from './activity-bar';
import './workspace.css';

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityBarWidth: 50,
            selectedView: undefined,
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

    render() {
        // console.log('workspace; => ', this.props)
        const selectedActivity = this.props.activities.find(a => {
            return this.props.selected === a.getSelector()
        });
        const ActivityView = selectedActivity.getView();
        
        return (
            <div className="workspace">
                <ActivityBar
                    style={this.activityBarSize()}
                    selected={this.props.selected}
                    activities={this.props.activities} 
                    buttonAction={this.props.activitySelect} />
                <ActivityView
                    {...this.activityViewSize()}
                    api={this.props.api}
                />
            </div>
        )
    }
}

export default Workspace;