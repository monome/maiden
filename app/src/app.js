import React, { Component } from 'react';
import BoundWorkspace from './bound-workspace';
import activities from './activities';
import './app.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.innerSize();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize)
  }

  innerSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  handleResize() {
    this.setState(this.innerSize());
  }

  render() {
    const headerStyle = {
      width: this.state.width,
      height: "6px",
    };

    return (
      <div>
        <div className="app-header" style={headerStyle} />
        <BoundWorkspace
          activities={activities}
          api={this.props.api}
          {...this.state}
        />
      </div>
    );
  }
}

export default App;
