import React from 'react';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import './modal-content.css';

const ModalContent = props => (
  <div className="modal-content">
    <div className="message-container">
      <span className="message">{props.message}</span>
      <p />
      <span className="supporting">{props.supporting}</span>
      <p />
      <p />
    </div>
    {props.children}
    <div className="button-container">
      <IconButton
        key="cancel"
        action={() => props.buttonAction('cancel')}
        tooltipMessage='cancel'
        tooltipPosition='top'
        icon={ICONS.cross}
        color="#979797" // FIXME:
        size="24"
      />
      <IconButton
        key="ok"
        action={() => props.buttonAction('ok')}
        tooltipMessage='ok'
        tooltipPosition='top'
        icon={ICONS.check}
        color="#979797" // FIXME:
        size="30"
      />
    </div>
  </div>
);

export default ModalContent;
