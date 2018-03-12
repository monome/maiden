import React, { Component } from 'react';
import './repl.css';


class ReplOutput extends Component {
    constructor(props) {
        super(props)
        this.scrollAdjusted = false;
    }

    /*
    componentDidMount() {
        this.output.onscroll = () => {
            this.scrollAdjusted = true;
            console.log("scrollAdjusted:", this.scrollAdjusted)
        }
   
        // this.observer = new MutationObserver(this.scrollToOutput);
        // this.observer.observe(this.output, {childList: true});
    }

    componentDidUpdate() {
        this.scrollToOutput();
    }

    scrollToOutput = () => {
        if (!this.scrollAdjusted) {
            console.log("scrollToOutput")
            this.output.scrollTop = this.output.scrollHeight;
        }
    }
    */

    componentDidUpdate() {
        // FIXME: this always forces scrolling to the bottom
        if (this.output) {
            this.output.scrollTo(0, this.output.scrollHeight)
        }
    }

    isScrolledBottom() {
        if (!this.output) {
            return false;
        }
        let top = this.output.scrollTop;
        let totalHeight = this.output.offsetHeight;
        let clientHeight = this.output.clientHeight;
        let atBottom = totalHeight <= top + clientHeight;
        console.log("top", top, "totalH", totalHeight, "clientH", clientHeight, "bottom", atBottom);
        return atBottom;
    }

    render() {
        let lines = this.props.lines.map((l, key) =>
            <div className="repl-line" key={key}>{l}</div>
        )
        
        // this.isScrolledBottom()
        return (
            <div 
                className="repl-output"
                ref={elem => this.output = elem}
            >
                {lines}
            </div>
        )
    };
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