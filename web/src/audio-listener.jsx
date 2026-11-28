import React, { Component } from 'react';

// Play audio from an already-fetched Blob. Serving dust files without HTTP
// Range / Content-Length makes Safari error and Chromium flap the seek bar
// when <audio src> hits the API URL directly.
//
// Parent should pass key={resource} so switching files remounts a fresh
// <audio> and the native play/pause UI cannot stick to the previous file.
class AudioListener extends Component {
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
    this.state = { objectUrl: null };
  }

  componentDidMount() {
    this.syncObjectUrl(null);
  }

  componentWillUnmount() {
    this.pause();
    this.revoke(this.state.objectUrl);
  }

  pause() {
    const audio = this.audioRef.current;
    if (audio) {
      audio.pause();
    }
  }

  revoke(url) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  syncObjectUrl(previousUrl) {
    this.revoke(previousUrl);
    const { blob } = this.props;
    const objectUrl = blob ? URL.createObjectURL(blob) : null;
    this.setState({ objectUrl });
  }

  render() {
    const { objectUrl } = this.state;
    if (!objectUrl) {
      return null;
    }
    return (
      <audio
        ref={this.audioRef}
        className="listener-container"
        src={objectUrl}
        controls
        preload="auto"
      />
    );
  }
}

export default AudioListener;
