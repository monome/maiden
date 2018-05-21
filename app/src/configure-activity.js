// import React, { Component } from 'react';
import React, {Component} from 'react';
import cx from 'classname';
import { VERSION, COMMIT } from './version';

import './configure-activity.css';

class ConfigureActivity extends Component {
  constructor(props) {
      super(props)
      
      this.state = {
          height: props.height,
          width: props.width,
      }
      
      props.editorConfig(this.props.api, 'api/v1/data/editor.json');
  }
  
  updateConfiguration(key, val) {
      let newEditorConfig = { ...this.props.editorOptions, [key]: val};
      
      this.props.updateEditorConfig(this.props.api, 'api/v1/data/editor.json', newEditorConfig);
  };
  
  renderEditorOption(key, val, label) {
      let editorOptionClasses = (key, val) => {
          if (val) {
              return cx('configure-option', {"is-selected": this.props.editorOptions[key] === val});
          } else {
              return cx('configure-option', {"is-selected": !this.props.editorOptions[key]});
          }
      }
      
      return (
          <div className={editorOptionClasses(key, val)}
              onClick={() => this.updateConfiguration(key, val)}>
              {label}
          </div>
      );
  }

  render() {
      return (
        <div className="configure-activity" style={this.state.style}>
          <div className="configure-upper">
            <div className="configure-header">
                editor options
            </div>
            <div className="configure-item">
                <div className="configure-label">
                    key bindings:
                </div>
                <div className="configure-options">
                    {this.renderEditorOption('keyBoardHandler', null, 'default (ace)')}
                    {this.renderEditorOption('keyBoardHandler', 'ace/keyboard/vim', 'vim')}
                    {this.renderEditorOption('keyBoardHandler', 'ace/keyboard/emacs', 'emacs')}
                </div>
            </div>
            <div className="configure-item">
                <div className="configure-label">
                    tab size:
                </div>
                <div className="configure-options">
                    {this.renderEditorOption('tabSize', 2, 'two')}
                    {this.renderEditorOption('tabSize', 4, 'four')}
                </div>
            </div>
          </div>
          <div className="configure-lower">
            <div className="configure-about">
              <span>maiden version: {VERSION} ({COMMIT})</span>
            </div>
          </div>
        </div>
      );
  }
};

export default ConfigureActivity;
