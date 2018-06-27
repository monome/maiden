import Linkify from 'react-linkify';
import React, { Component } from 'react';
import './repl.css';

class ReplOutput extends Component {
  constructor(props) {
    super(props);
    this.scrollAdjusted = false;
  }

  componentDidUpdate() {
    // FIXME: this always forces scrolling to the bottom
    if (this.output) {
      this.output.scrollTo(0, this.output.scrollHeight);
    }
  }

  isScrolledBottom() {
    if (!this.output) {
      return false;
    }
    const top = this.output.scrollTop;
    const totalHeight = this.output.offsetHeight;
    const clientHeight = this.output.clientHeight;
    const atBottom = totalHeight <= top + clientHeight;
    console.log('top', top, 'totalH', totalHeight, 'clientH', clientHeight, 'bottom', atBottom);
    return atBottom;
  }

  linkify(l) {
    return <Linkify properties={{ target: '_blank' }}>{l}</Linkify>;
  }

  render() {
    const lines = this.props.lines.map((l, key) => (
      <div className="repl-line" key={key}>
        {this.linkify(l)}
      </div>
    ));

    // this.isScrolledBottom()
    return (
      <div className="repl-output" ref={elem => (this.output = elem)}>
        {lines}
      </div>
    );
  }
}

class ReplInput extends Component {
  constructor(props) {
    super(props);
    this.histroyIdx = 0;
  }

  onKeyDown = event => {
    let history;

    switch (event.keyCode) {
      case 13: // return
        event.preventDefault();
        this.props.sendCommand(this.input.value);
        this.input.value = '';
        this.historyIdx = 0;
        break;

      case 38: // up arrow
        event.preventDefault();
        history = this.props.history;
        if (this.historyIdx < history.size) {
          this.input.value = history.get(this.historyIdx);
          this.historyIdx += 1;
        }
        break;

      case 40: // down arrow
        event.preventDefault();
        this.historyIdx -= 1;
        if (this.historyIdx < 0) {
          this.historyIdx = 0;
          this.input.value = '';
        } else {
          this.input.value = this.props.history.get(this.historyIdx);
        }
        break;

      default:
        break;
    }
  };

  componentDidMount() {
    this.input.focus();
  }

  render() {
    return (
      <div className="repl-input">
        <span className="label">>></span>
        <textarea
          className="value"
          ref={e => {
            this.input = e;
          }}
          onKeyDown={this.onKeyDown}
          autoFocus="true"
          spellCheck="false"
          rows={1}
        />
      </div>
    );
  }
}
class Repl extends Component {
  sendCommand = text => {
    this.props.replSend(this.props.activeRepl, text);
  };

  render() {
    let lines = this.props.buffers.get(this.props.activeRepl);
    if (lines === undefined) {
      lines = [];
    }
    const history = this.props.history.get(this.props.activeRepl);
    const style = {
      height: this.props.height,
      width: this.props.width,
    };
    return (
      <div className="repl" style={style}>
        <ReplOutput lines={lines} />
        <ReplInput sendCommand={this.sendCommand} history={history} />
      </div>
    );
  }
}

export default Repl;
