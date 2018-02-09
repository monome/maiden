import React, { Component } from 'react';
import './repl.css';


const ReplOutput = (props) => {
    // FIXME: some lines have multiple \n\n but we are still displaying as one line
    let children = props.lines.map((l) =>
        <div className="repl-line">{l}</div>
    )
    return (
        <div className="repl-output">
            {children}
        </div>
    )
}

class ReplInput extends Component {
    constructor(props) {
        super(props);
        this.histroyIdx = 0;
    }

    onKeyDown = (event) => {
        var history;

        switch (event.keyCode) {
            case 13: // return
                event.preventDefault();
                this.props.sendCommand(this.input.value);
                this.input.value = "";
                this.historyIdx = 0;
                break;
            
            case 38: // up arrow
                event.preventDefault();
                history = this.props.history
                if (this.historyIdx < history.size) {
                    this.input.value = history.get(this.historyIdx)
                    this.historyIdx += 1;
                }
                break;

            case 40: // down arrow
                event.preventDefault();
                this.historyIdx -= 1;
                if (this.historyIdx < 0) {
                    this.historyIdx = 0;
                    this.input.value = ""
                }
                else {
                    this.input.value = this.props.history.get(this.historyIdx)
                }
                break;
        
            default:
                break;
        }
    }

    componentDidMount() {
        this.input.focus()
    }

    render() {
        return (
            <div className="repl-input">
                <span className="label">>></span>
                <textarea 
                    className="value"
                    ref={(e) => { this.input = e }}
                    onKeyDown={this.onKeyDown}
                    autoFocus="true"
                    spellCheck="false"
                />
            </div>
        )
    }
}
class Repl extends Component {

    sendCommand = (text) => {
        this.props.replSend(this.props.activeRepl, text)
    }

    render() {
        let lines = this.props.buffers.get(this.props.activeRepl);
        if (lines === undefined) {
            lines = [];
        }
        let history = this.props.history.get(this.props.activeRepl);
        const style = {
            height: this.props.height,
            width: this.props.width,
        };
        return (
            <div className="repl" style={style}>
                <ReplOutput lines={lines}/>
                <ReplInput 
                    sendCommand={this.sendCommand}
                    history={history}
                />
            </div>
        );
    }
};

export default Repl;