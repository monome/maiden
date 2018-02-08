import React, { Component } from 'react';
import './repl.css';

const ReplOutput = (props) => {
    return (
        <div className="repl-output" />
    )
}

const ReplInput = (props) => {
    return (
        <div className="repl-input">
            <span className="label">command: </span>
            <span className="value">some value?</span>
        </div>
    )
}
class Repl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
        };
    }
    
    render() {
        const style = {
            height: this.props.height,
            width: this.props.width,
        };
        return (
            <div className="repl" style={style}>
                <ReplOutput />
                <ReplInput component={this.props.component} replSend={this.props.replSend} />
            </div>
        );
    }
};

export default Repl;