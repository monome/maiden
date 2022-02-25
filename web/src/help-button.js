import React from 'react';
import Popup from 'reactjs-popup';
import './help-button.css';

const trigger = <div className="help-button-menu">?</div>;

const HelpButton = _props => (
  <Popup
    trigger={trigger}
    on="hover"
    className="help-button-popup"
    closeOnDocumentClick
    mouseLeaveDelay={180}
    mouseEnterDelay={0}
    position="right center"
    arrow={false}
  >
    <div>
      <div>
        <a
          className="help-button-link"
          href="https://monome.org/docs/norns/"
          target="_blank"
          key="overview"
          rel="noopener noreferrer"
        >
          overview...
        </a>
      </div>
      <div>
        <a
          className="help-button-link"
          href="https://monome.org/docs/norns/reference/"
          target="_blank"
          key="reference"
          rel="noopener noreferrer"
        >
          script reference...
        </a>
      </div>
      <div>
        <a
          className="help-button-link"
          href="/doc"
          target="_blank"
          key="api"
          rel="noopener noreferrer"
        >
          api...
        </a>
      </div>
    </div>
  </Popup>
);

export default HelpButton;
