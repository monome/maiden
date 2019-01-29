import { connect } from 'react-redux';
import ConfigureActivity from './configure-activity';

import { updateEditorConfig, editorConfig } from './model/config-actions';

const mapStateToProps = state => {
  const editorOptions = state.config.editor;
  return { editorOptions };
};

const mapDispatchToProps = dispatch => ({
  updateEditorConfig: (resource, value) => {
    dispatch(updateEditorConfig(resource, value));
  },
  editorConfig: resource => {
    dispatch(editorConfig(resource));
  },
});

const BoundConfigureActivity = connect(mapStateToProps, mapDispatchToProps)(ConfigureActivity);

export default BoundConfigureActivity;
