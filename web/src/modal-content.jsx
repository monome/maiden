import React from 'react';
import IconButton from './icon-button';
import { ICONS } from './svg-icons';
import './modal-content.css';

const ModalContent = props => {
  const cancelButton = (
    <IconButton
      key="cancel"
      action={() => props.buttonAction('cancel')}
      tooltipMessage="cancel"
      tooltipPosition="top"
      icon={ICONS.cross}
      color="hsl(0, 0%, 59%)"
      size="24"
    />
  );

  const okButton = (
    <IconButton
      key="ok"
      action={() => props.buttonAction('ok')}
      tooltipMessage="ok"
      tooltipPosition="top"
      icon={ICONS.check}
      color="hsl(0, 0%, 59%)"
      size="30"
    />
  );

  let buttons = [cancelButton, okButton];
  if (props.confirmOnly) {
    buttons = [okButton];
  }

  return (
    <div className="modal-content" style={props.style}>
      <div className="message-container">
        <span className="message">{props.message}</span>
        <p />
        <span className="supporting">{props.supporting}</span>
        <p />
        <p />
      </div>
      {props.children}
      <div className="button-container">{buttons}</div>
    </div>
  );
};

export default ModalContent;
