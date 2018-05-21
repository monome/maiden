import { connect } from 'react-redux';
import ConfigureActivity from './configure-activity';

import { updateEditorConfig, editorConfig } from './model/config-actions';

const mapStateToProps = (state) => {
  const editorOptions = state.config.editor;
  return { editorOptions };
};

const mapDispatchToProps = dispatch => ({
  updateEditorConfig: (api, resource, value) => {
    dispatch(updateEditorConfig(api, resource, value));
  },
  editorConfig: (api, resource) => {
    dispatch(editorConfig(api, resource));
  }
});

const BoundConfigureActivity = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigureActivity);

export default BoundConfigureActivity;
