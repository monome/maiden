import React, { Component } from 'react';
import './help-button.css';

const links = [
  {
    href: 'https://monome.org/docs/norns/',
    label: 'overview...',
  },
  {
    href: 'https://monome.org/docs/norns/reference/',
    label: 'script reference...',
  },
  {
    href: '/doc',
    label: 'api...',
  },
];

/*
  Local hover menu — reactjs-popup v2 treats hover triggers as tooltips
  (autofocus first link, tooltip shell CSS, subpixel portal positioning),
  which broke this control's chrome. Keeping the dependency was not worth it
  for a three-link menu.
*/
class HelpButton extends Component {
  state = {
    open: false,
  };

  openTimer = null;

  closeTimer = null;

  componentWillUnmount() {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
  }

  handleEnter = () => {
    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      this.setState({ open: true });
    }, 0);
  };

  handleLeave = () => {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.setState({ open: false });
    }, 180);
  };

  render() {
    const { open } = this.state;

    return (
      <div className="help-button" onMouseEnter={this.handleEnter} onMouseLeave={this.handleLeave}>
        <div className="help-button-menu">?</div>
        {open && (
          <div className="help-button-popup-panel">
            {links.map((link) => (
              <div key={link.href}>
                <a
                  className="help-button-link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default HelpButton;
