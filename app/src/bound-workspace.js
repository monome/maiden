import { connect } from 'react-redux';
import Workspace from './workspace';

import {
    activitySelect,
} from './model/activity-actions';

const mapStateToProps = (state) => {
    const selected = state.activity.selected;
    return { selected };
}

const mapDispatchToProps = (dispatch) => {
    return {
        activitySelect: (name) => {
            dispatch(activitySelect(name))
        },
    }
}

const BoundWorkspace = connect(
    mapStateToProps,
    mapDispatchToProps
)(Workspace);

export default BoundWorkspace;