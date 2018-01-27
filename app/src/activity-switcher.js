import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
// import './activity-switcher.css'
import ActivityBar from './activity-bar'
import Sidebar from './sidebar'

class ActivitySwitcher extends Component {
    constructor(props) {
        super(props);

        this.handleActivityClicked = this.handleActivityClicked.bind(this);
        this.isActivityActive = this.isActivityActive.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);

        this.state = {
            activeKey: props.activities[0].name,
            sidebarVisible: true,
        }
    }

    handleActivityClicked(activityName) {
        if (activityName === this.state.activeKey) {
            this.toggleSidebar()
        } else {
            this.setState({
                activeKey: activityName,
                sidebarVisible: true,
            })
        }
    }

    isActivityActive(activityName) {
        return activityName === this.state.activeKey;
    }

    toggleSidebar() {
        this.setState((prevState, props) => ({
            sidebarVisible: !prevState.sidebarVisible
        }));
        console.log('toggleSidebar() -> ', this.state.sidebarVisible);
    }

    render() {
        return (
            <SplitPane
                split="vertical"
                className="activity-switcher">
                <ActivityBar
                    activities={this.props.activities}
                    onActivityClicked={this.handleActivityClicked}
                    isActive={this.isActivityActive}
                 />
                {this.state.sidebarVisible &&
                    <Sidebar />
                }
            </SplitPane>
        );
    }
}

export default ActivitySwitcher;