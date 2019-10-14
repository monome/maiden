import React, { Component } from 'react';
import BoundWorkspace from './bound-workspace';
import BoundUrlHandler from './bound-url-handler'
import activities from './activities';
import './app.css';
import './tool-tip.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.innerSize();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  innerSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight - 6,
    };
  }

  handleResize() {
    this.setState(this.innerSize());
  }

  render() {
    const headerStyle = {
      width: this.state.width,
      height: 6,
    };

    return (
      <div>
        <div className="app-header" style={headerStyle} />
        <BoundUrlHandler />
        <BoundWorkspace activities={activities} {...this.state} />
      </div>
    );
  }
}

export default App;
