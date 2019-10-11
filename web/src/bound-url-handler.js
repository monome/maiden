import { Component } from 'react';
import { connect } from 'react-redux';
import { pathToResource } from './utils'
import { bufferSelect, directoryReadRecursive } from './model/edit-actions'

// This might be better as a hook (not much of a class), 
// but they are only supported in react-redux ^7.1
class UrlHandler extends Component {
  constructor(props) {
    super(props);
    this._loaded = false;
  }

  showFileFromUrl() {
    if (this._loaded) {
      return;
    }

    const resource = pathToResource(this.props.pathname);
    this.props.showFile(resource);
    this._loaded = true;
  }

  componentDidMount() {
    this.showFileFromUrl();
  }

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  pathname: state.router.location.pathname,
});

const mapDispatchToProps = dispatch => ({
  showFile: async resource => {
    dispatch(await directoryReadRecursive(resource));
    dispatch(bufferSelect(resource));
  },
});

const BoundUrlHandler = connect(mapStateToProps, mapDispatchToProps)(UrlHandler);
export default BoundUrlHandler;