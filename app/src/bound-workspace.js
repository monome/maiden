import { connect } from 'react-redux';
import Workspace from './workspace';

import {
    activitySelect,
} from './model/activity-actions';

import {
    sidebarToggle,
} from './model/sidebar-actions';

import {
    replConnect,
} from './model/repl-actions';

const mapStateToProps = (state) => {
    const selected = state.activity.selected;
    return { selected };
}

const mapDispatchToProps = (dispatch) => {
    return {
        activitySelect: (name) => {
            dispatch(activitySelect(name))
        },
        sidebarToggle: () => {
            dispatch(sidebarToggle())
        },
        replConnect: (component, endpoint) => {
            dispatch(replConnect(component, endpoint))
        },
    }
}

const BoundWorkspace = connect(
    mapStateToProps,
    mapDispatchToProps
)(Workspace);

export default BoundWorkspace;