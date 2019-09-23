import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Set } from 'immutable';
import { siblingNamesForResource } from './model/listing';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import { INVALID_NAME_CHARS } from './constants';

const mapStateToProps = state => {
  const getSiblingNames = selectedResource => {
    if (selectedResource) {
      return siblingNamesForResource(state.edit.rootNodes, selectedResource);
    }
    return new Set();
  };

  return {
    getSiblingNames,
  };
};

class ModalGetName extends Component {
  constructor(props) {
    super(props);
    this.textArea = undefined;
    this.state = {
      showError: false,
      errorMessage: '',
      newName: this.props.initialName,
    };

    this.siblingNames = props.getSiblingNames(this.props.selectedResource);
  }

  handleKeyDown = event => {
    // filter out chars we can't have in names
    if (INVALID_NAME_CHARS.has(event.key)) {
      console.log("character '", event.key, "' not allowed in names");
      event.preventDefault();
      return;
    }

    switch (event.keyCode) {
      case 13: // return
        event.preventDefault();
        this.complete('ok');
        break;

      case 27: // escape
        event.preventDefault();
        this.complete('cancel');
        break;

      default:
        break;
    }
  };

  handleOnChange = () => {
    const newName = this.textArea.value;
    if (newName !== this.props.initialName && this.siblingNames.has(newName)) {
      this.setState({
        errorMessage: 'name already in use',
        newName,
      });
    } else if (this.textArea.value.startsWith(".")) {
      this.setState({
        errorMessage: 'name cannot start with "."',
        newName,
      });
    } else {
      this.setState({
        errorMessage: '',
        newName,
      });
    }
  };

  isValidName = name => (name === this.props.initialName || !this.siblingNames.has(name)) && !name.startsWith(".");

  complete = choice => {
    const name = this.state.newName;
    if (choice === 'ok' && !this.isValidName(name)) {
      // prevent completion if name is bad
      return;
    }
    this.props.buttonAction(choice, this.state.newName);
  };

  componentDidMount() {
    this.textArea.select();
  }

  render() {
    return (
      <div className="modal-content">
        <div className="message-container">
          <span className="message">{this.props.message}</span>
          <p />
        </div>
        <textarea
          className="get-name-modal-text-area"
          ref={e => (this.textArea = e)}
          value={this.state.newName || ''}
          rows="1"
          maxLength="128"
          wrap="false"
          autoFocus="true"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleOnChange}
        />
        <div className="get-name-modal-error-message">{this.state.errorMessage}</div>
        <div className="button-container">
          <IconButton
            key="cancel"
            action={() => this.complete('cancel')}
            icon={ICONS.cross}
            color="hsl(0, 0%, 59%)"
            size="24"
          />
          <IconButton
            key="ok"
            action={() => this.complete('ok')}
            icon={ICONS.check}
            color="hsl(0, 0%, 59%)"
            size="30"
          />
        </div>
      </div>
    );
  }
}

// export default ModalGetName;
export default connect(mapStateToProps)(ModalGetName);
