import { connect } from 'react-redux';
import ReplActivity from './repl-activity';

import {
    replSend
} from './model/repl-actions';


const mapStateToProps = (state) => {
    // TODO: pull out the buffer and history for the active repl to avoid re-renders if output to no-active repl is received.
    let { activeRepl, buffers, history } = state.repl;
    return { activeRepl, buffers, history };
}

const mapDispatchToProps = (dispatch) => {
    return {
        replSend: (component, value) => {
            dispatch(replSend(component, value))
        }
    }
}

const BoundReplActivity = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReplActivity);

export default BoundReplActivity;
