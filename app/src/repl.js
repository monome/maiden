import React, { Component } from 'react';
// import { Terminal } from 'xterm';
// import * as fit from 'xterm/dist/addons/fit/fit';
// import * as attach from 'xterm/dist/addons/attach/attach';
// import 'xterm/dist/xterm.css'
import './repl.css';

class Repl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
        };
    }

    /*
    componentDidMount() {
        console.log(this.refs.container)
        // Terminal.applyAddon(fit);
        Terminal.applyAddon(attach);
        this.xterm = new Terminal({
            cursorBlink: true,
            rows: 24,
            cols: 80,
            convertEol: true,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace', // FIXME: move to style sheet some how
            fontSize: 12,
            // debug: true,
            // useFlowControl: true,

        });
        this.xterm.open(this.refs.container);
        // this.xterm.fit();
        
        // FIXME: handle errors
        if (this.props.api) {
            this.socket = this.props.api.repl_socket();
            //this.xterm.attach(this.socket);
            this.socket.onmessage = (message) => {
                // console.log(message)
                this.xterm.write(message.data);
            };
        }

        // behavior
        this.xterm.on('focus', () => this.focusChanged(true));
        this.xterm.on('blur', () => this.focusChanged(false));
        this.xterm.on('data', this.onInput);
        
        // splash?
        this.xterm.writeln("norns repl...");
    }

    componentWillUnmount() {
        console.log("closing: ", this.socket);
        this.socket.close();
    }

    focusChanged = (focused) => {
        this.setState({ focused });
    }

    onInput = (stuff) => {
        // since this really isn't a terminal we need to do local echo
        // if (stuff === '') {
            // console.log("convert <cr>")
            // stuff = '\r';
        // }
        this.xterm.write(stuff);
        this.socket.send(stuff);
        console.log(`onInput('${stuff}')`);
    }
    */
    
    render() {
        const style = {
            height: this.props.height,
            width: this.props.width,
        };
        return (
            <div ref="container" className="repl" style={style} />
        );
    }
};

export default Repl;