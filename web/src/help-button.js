import React from 'react';
import Popup from 'reactjs-popup';
import './help-button.css';

const trigger = (
    <div className="help-button-menu">?</div>
);

// FIXME: figure out how to define this style in css
const contentStyle = {
    fontFamily: 'monospace',
    backgroundColor: '#F4F4F4',
    padding: '6px',
    opacity: '40%',
    border: '1px solid rgb(130, 130, 130, 0.1)', // magic color to approx splitter bar color
    borderLeft: 'none',
    boxShadow: 'none',
    paddingLeft: '.4em',
};

const HelpButton = props => (
    <Popup
        trigger={trigger}
        on='hover'
        contentStyle={contentStyle}
        closeOnDocumentClick
        mouseLeaveDelay={180}
        mouseEnterDelay={0}
        position='right center'
        arrow={false}>
            <div>
              <a className="help-button-link"
                  href="https://monome.org/docs/norns/"
                  target="_blank"
                  key="overview"
                  rel="noopener noreferrer">overview...</a>
            </div>
            <div>
              <a className="help-button-link"
                  href="https://monome.org/docs/norns/script-reference/" target="_blank"
                  key="reference"
                  rel="noopener noreferrer">script reference...</a>
            </div>
            <div>
              <a className="help-button-link"
                  href="/doc"
                  target="_blank"
                  key="api"
                  rel="noopener noreferrer">api...</a>
            </div>
    </Popup>
);

export default HelpButton;
