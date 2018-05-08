import React, { Component } from 'react';
import { connect } from 'react-redux';
import { siblingNamesForResource } from './model/listing';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import { INVALID_NAME_CHARS } from './constants';

const mapStateToProps = (state) => {
  // renaming is relative to some active node; get sibling names to enable validation
  const siblingNames = siblingNamesForResource(state.edit.rootNodes, state.edit.activeBuffer);
  return {
    siblingNames,
  };
};

class ModalRename extends Component {
  constructor(props) {
    super(props);
    this.textArea = undefined;
    this.state = {
      showError: false,
      errorMessage: '',
    };
  }

    handleKeyDown = (event) => {
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
    }

    handleOnChange = (_event) => {
      if (this.props.siblingNames.has(this.textArea.value)) {
        this.setState({
          errorMessage: 'name already in use',
        });
      } else {
        this.setState({
          errorMessage: '',
        });
      }
    }

    isValidName = name => !this.props.siblingNames.has(name)


    complete = (choice) => {
      const name = this.textArea.value;
      if (choice === 'ok' && !this.isValidName(name)) {
        // prevent completion if name is bad
        return;
      }
      this.props.buttonAction(choice, this.textArea.value);
    }

    render() {
      return (
        <div className="modal-content">
          <div className="message-container">
            <span className="message">{this.props.message}</span>
            <p />
          </div>
          <textarea
            className="rename-modal-text-area"
            ref={e => this.textArea = e}
            placeholder={this.props.initialName}
            rows="1"
            maxLength="128"
            wrap="false"
            autoFocus="true"
            onKeyDown={this.handleKeyDown}
            onChange={this.handleOnChange}
          />
          <div className="rename-modal-error-message">
            {this.state.errorMessage}
          </div>
          <div className="button-container">
            <IconButton
              key="cancel"
              action={() => this.complete('cancel')}
              icon={ICONS.cross}
              color="#979797" // FIXME:
              size="24"
            />
            <IconButton
              key="ok"
              action={() => this.complete('ok')}
              icon={ICONS.check}
              color="#979797" // FIXME:
              size="30"
            />
          </div>
        </div>
      );
    }
}

// export default ModalRename;
export default connect(mapStateToProps)(ModalRename);
