import React, { Component } from 'react';
import './repl.css';


const ReplOutput = (props) => {
    let children = props.lines.map((l) => {
        return (
            <div className="repl-line">{l}</div>
        )
    })
    return (
        <div className="repl-output">
            {children}
        </div>
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
    render() {
        let lines = this.props.buffers.get(this.props.activeRepl);
        if (lines === undefined) {
            lines = [];
        }
        const style = {
            height: this.props.height,
            width: this.props.width,
        };
        return (
            <div className="repl" style={style}>
                <ReplOutput lines={lines}/>
                <ReplInput component={this.props.component} replSend={this.props.replSend} />
            </div>
        );
    }
};

export default Repl;