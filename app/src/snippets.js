/* eslint-disable no-template-curly-in-string */
const snippets = {
  cleanup: {
    code: '-- cleanup, release memory\nfunction cleanup()\n  ${0}\nend',
    doc: 'called on script quit, release memory',
  },
  init: {
    code: '--- init function\nfunction init()\n  ${0}\nend',
    doc: 'called on script init',
  },
  enc: {
    code: '--- enc function\nfunction enc(n, delta)\n  ${0}\nend',
    doc: 'called on encoder delta',
  },
  gridkey: {
    code: '--- grid key function\nfunction gridkey(x, y, state)\n  ${0}\nend',
    doc: 'called on grid key events',
  },
  key: {
    code: '--- key function\nfunction key(n, z)\n  ${0}\nend',
    doc: 'called on key press/release',
  },
  redraw: {
    code: '--- screen redraw function\nfunction redraw()\n  ${0}\nend',
    doc: 'called on screen redraw',
  },
  // TODO (pq): add midi, hid, ...
};
/* eslint-enable no-template-curly-in-string */

export const nornsSnippetCompleter = {
  getCompletions(editor, session, pos, prefix, callback) {
    callback(
      null,
      Object.keys(snippets).map((word) => ({
        caption: word,
        value: word,
        snippet: snippets[word].code,
        score: 1000,
        meta: 'norns',
        doc: snippets[word].doc,
      })),
    );
  },
  getDocTooltip(item) {
    if (item.meta === 'norns' && !item.docHTML) {
      /* eslint-disable-next-line no-param-reassign */
      item.docHTML = [
        '<b>',
        item.caption,
        '</b>',
        '<hr></hr>',
        item.doc,
        // "<hr></hr>",
        // item.snippet
      ].join('');
    }
  },
};
