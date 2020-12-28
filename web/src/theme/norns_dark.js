// based on "tomorrow night"
//
// * suppresses background image on gutter errors / warnings in favor of color (a la "chaos")
import ace from 'ace-builds/src-noconflict/ace';

/* eslint-disable no-param-reassign */
ace.define(
  'ace/theme/norns_dark',
  ['require', 'exports', 'module', 'ace/lib/dom'],
  (acequire, exports, _) => {
    exports.isDark = true;
    exports.cssClass = 'ace-norns-dark';
    exports.cssText = `
  .ace-norns-dark .ace_gutter {
    background: #25282c;
    color: #C5C8C6
  }
  .ace-norns-dark .ace_gutter-cell.ace_warning {
    background-image: none;
    background: #FC0;
    border-left: none;
    padding-left: 0;
    color: #000;
  }
  .ace-norns-dark .ace_gutter-cell.ace_error {
    background-position: -6px center;
    background-image: none;
    background: #D20E0E;
    border-left: none;
    padding-left: 0;
    color: #000;
  }
  .ace-norns-dark .ace_print-margin {
    width: 1px;
    background: #25282c
  }
  .ace-norns-dark {
    background-color: #1D1F21;
    color: #C5C8C6
  }
  .ace-norns-dark .ace_cursor {
    color: #AEAFAD
  }
  .ace-norns-dark .ace_marker-layer .ace_selection {
    background: #373B41
  }
  .ace-norns-dark.ace_multiselect .ace_selection.ace_start {
    box-shadow: 0 0 3px 0px #1D1F21;
  }
  .ace-norns-dark .ace_marker-layer .ace_step {
    background: rgb(102, 82, 0)
  }
  .ace-norns-dark .ace_marker-layer .ace_bracket {
    margin: -1px 0 0 -1px;
    border: 1px solid #4B4E55
  }
  .ace-norns-dark .ace_marker-layer .ace_active-line {
    background: #282A2E
  }
  .ace-norns-dark .ace_gutter-active-line {
    background-color: #282A2E
  }
  .ace-norns-dark .ace_marker-layer .ace_selected-word {
    border: 1px solid #373B41
  }
  .ace-norns-dark .ace_invisible {
    color: #4B4E55
  }
  .ace-norns-dark .ace_keyword,
  .ace-norns-dark .ace_meta,
  .ace-norns-dark .ace_storage,
  .ace-norns-dark .ace_storage.ace_type,
  .ace-norns-dark .ace_support.ace_type {
    color: #B294BB
  }
  .ace-norns-dark .ace_keyword.ace_operator {
    color: #8ABEB7
  }
  .ace-norns-dark .ace_constant.ace_character,
  .ace-norns-dark .ace_constant.ace_language,
  .ace-norns-dark .ace_constant.ace_numeric,
  .ace-norns-dark .ace_keyword.ace_other.ace_unit,
  .ace-norns-dark .ace_support.ace_constant,
  .ace-norns-dark .ace_variable.ace_parameter {
    color: #DE935F
  }
  .ace-norns-dark .ace_constant.ace_other {
    color: #CED1CF
  }
  .ace-norns-dark .ace_invalid {
    color: #CED2CF;
    background-color: #DF5F5F
  }
  .ace-norns-dark .ace_invalid.ace_deprecated {
    color: #CED2CF;
    background-color: #B798BF
  }
  .ace-norns-dark .ace_fold {
    background-color: #81A2BE;
    border-color: #C5C8C6
  }
  .ace-norns-dark .ace_entity.ace_name.ace_function,
  .ace-norns-dark .ace_support.ace_function,
  .ace-norns-dark .ace_variable {
    color: #81A2BE
  }
  .ace-norns-dark .ace_support.ace_class,
  .ace-norns-dark .ace_support.ace_type {
    color: #F0C674
  }
  .ace-norns-dark .ace_heading,
  .ace-norns-dark .ace_markup.ace_heading,
  .ace-norns-dark .ace_string {
    color: #B5BD68
  }
  .ace-norns-dark .ace_entity.ace_name.ace_tag,
  .ace-norns-dark .ace_entity.ace_other.ace_attribute-name,
  .ace-norns-dark .ace_meta.ace_tag,
  .ace-norns-dark .ace_string.ace_regexp,
  .ace-norns-dark .ace_variable {
    color: #CC6666
  }
  .ace-norns-dark .ace_comment {
    color: #969896
  }`;

    const dom = acequire('../lib/dom');
    dom.importCssString(exports.cssText, exports.cssClass);
  },
);
