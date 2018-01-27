
import React, { Component } from 'react';
import ActivityBar from './activity-bar';
import ScriptEditor from './script-editor';
import './workspace.css';

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityBarWidth: 50,
            selectedActivity: this.props.activities[0],
            selectedView: undefined,
        };
        this.handleActivityClicked = this.handleActivityClicked.bind(this);
        this.isActive = this.isActive.bind(this);
    }

    componentWillMount() {

    }

    handleActivityClicked(key) {
        // if this is a new activity, switch active
        if (this.isActive(key) && this.state.selectedView) {
            console.log(this.state.selectedView);
            // this.state.selectedView.doToggle();
        }
        else {
            const activity = this.props.activities.find((a) => {
                return a.key === key;
            });
            this.setState({
                selectedActivity: activity,
                selectedView: activity.getView({
                    ...this.activityViewSize(),
                })
            });
        }
    }

    isActive(key) {
        const selected = this.state.selectedActivity;
        return (selected && selected.key === key);
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
        // const {height, width} = this.activityViewSize();
        // const view = this.state.selectedActivity.getView({
        //     className: "activity-view",
        //     ...this.activityViewSize(),
        // });
        return (
            <div className="workspace">
                <ActivityBar
                    style={this.activityBarSize()}
                    isActive={this.isActive}
                    onActivityClicked={this.handleActivityClicked}
                    activities={this.props.activities} />
                {/* {this.state.selectedView} */}
                <ScriptEditor
                    {...this.activityViewSize()}
                    api={this.props.api}
                />
            </div>
        )
    }
}

export default Workspace;