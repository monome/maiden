import { Component } from 'react';
import { connect } from 'react-redux';
import { bufferSelect, directoryReadRecursive } from './model/edit-actions'
import { inSameDir, isEditPath, pathToResource } from './url-utils'

// This might be better as a hook (not much of a class), 
// but they are only supported in react-redux ^7.1
class UrlHandler extends Component {
  constructor(props) {
    super(props);
    this._loadedPath = '';
  }

  showFileFromUrl() {
    const { pathname } = this.props;
    if (!isEditPath(pathname)) {
      return;
    }

    const resource = pathToResource(pathname);
    if (!inSameDir(this._loadedPath, pathname)) {
      this.props.directoryReadRecursive(resource);
    }
    this.props.bufferSelect(resource);
    this._loadedPath = pathname;
  }

  render() {
    if (!this.props.pathname !== this._loadedPath) {
      this.showFileFromUrl();
    }
    return null;
  }
}

const mapStateToProps = state => {
  const { hash } = state.router.location;
  return {
    pathname: hash && hash[0] === '#' ? hash.substring(1) : ''
  }
};

const mapDispatchToProps = dispatch => ({
  bufferSelect: resource => {
    dispatch(bufferSelect(resource));
  },
  directoryReadRecursive: async resource => {
    dispatch(directoryReadRecursive(resource));
  }
});

const BoundUrlHandler = connect(mapStateToProps, mapDispatchToProps)(UrlHandler);
export default BoundUrlHandler;