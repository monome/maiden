import React, { Component } from 'react';
import Workspace from './workspace';
import './app.css';

const activities = [
  // new EditActivity(api),
];

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
    return (
      <Workspace
        activities={activities}
        api={this.props.api}
        {...this.state}
      />
    );
  }
}

export default App;
