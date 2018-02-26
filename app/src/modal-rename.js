import React, { Component } from 'react';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
// import './modal-content.css';

class ModalRename extends Component {
    constructor(props) {
        super(props)
        this.textArea = undefined
    }
    
    handleKeyDown = (event) => {
        switch (event.keyCode) {
         case 13:            // return
            event.preventDefault()
            this.complete('ok')
            break;

        case 27:            // escape
            event.preventDefault()
            this.complete('cancel')
            break;

        default:
            break;
        }
    }

    complete = (choice) => {
        this.props.buttonAction(choice, this.textArea.value)
    }

    render() {
        return (
            <div className="modal-content">
            <div className="message-container">
                <span className="message">{this.props.message}</span>
                <p/>
            </div>
            <textarea
                    className="rename-modal-text-area"
                    ref={(e) => this.textArea = e}
                    placeholder={this.props.initialName}
                    rows="1"
                    maxLength="128"
                    wrap="false"
                    autoFocus="true"
                    onKeyDown={this.handleKeyDown}
                />
            <p/>
            <div className="button-container">
                <IconButton
                    key='cancel'
                    action={() => this.complete('cancel')}
                    icon={ICONS['cross']}
                    color="#979797"   // FIXME:
                    size="24"
                />
                <IconButton
                    key='ok'
                    action={() => this.complete('ok')}
                    icon={ICONS['check']}
                    color="#979797"   // FIXME:
                    size="30"
                />
            </div>
            </div>
        )
    }
}

export default ModalRename;