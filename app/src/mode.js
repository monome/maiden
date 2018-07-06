export default class EditorMode {
  constructor(id) {
    this.id = id;
    this.enableSnippets = true;
  }

  /* eslint-disable-next-line no-unused-vars */
  onRender(editor) {
    // no-op; optionally implemented in subclasses.
  }
}
