import { Component } from 'react';

class ActivityView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sidebarVisible: true,
        };
        this.wasSelected = this.wasSelected.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.doToggle = this.doToggle.bind(this);
    }

    getKey() {
        return this.key;
    }

    wasSelected() {
        if (this.props.isActive) {
            this.toggleSidebar();
        }
    }

    doToggle() {
        // generic toggle bahavior invoked by workspace
        this.toggleSidebar();
    }

    toggleSidebar() {
        this.setState((prevState, props) => ({
            sidebarVisible: !prevState.sidebarVisible
        }));
        console.log('toggleSidebar() -> ', this.state.sidebarVisible);
    }


    // render() {
    //     return (
    //         <div>ActivityView</div>
    //     );
    // }
}

export default ActivityView;