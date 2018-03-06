import { connect } from 'react-redux';
import Workspace from './workspace';

import {
    activitySelect,
} from './model/activity-actions';

import {
    sidebarToggle,
} from './model/ui-actions';

import {
    replEndpoints,
    replConnect,
} from './model/repl-actions';

import {
    scriptList,
} from './model/script-actions';

const mapStateToProps = (state) => {
    const selected = state.activity.selected;
    const endpoints = state.repl.endpoints;
    return { selected, endpoints };
}

const mapDispatchToProps = (dispatch) => {
    return {
        activitySelect: (name) => {
            dispatch(activitySelect(name))
        },
        sidebarToggle: () => {
            dispatch(sidebarToggle())
        },
        replEndpoints: (api, cb) => {
            dispatch(replEndpoints(api, cb))
        },
        replConnect: (component, endpoint) => {
            dispatch(replConnect(component, endpoint))
        },
        scriptList: (api) => {
            dispatch(scriptList(api))
        },
    }
}

const BoundWorkspace = connect(
    mapStateToProps,
    mapDispatchToProps
)(Workspace);

export default BoundWorkspace;