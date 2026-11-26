import { nornsSnippetCompletionItems, snippets } from './snippets';

const monacoStub = {
  languages: {
    CompletionItemKind: { Snippet: 27 },
    CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
  },
};

describe('nornsSnippetCompletionItems', () => {
  it('returns all snippets when prefix is empty', () => {
    const items = nornsSnippetCompletionItems(monacoStub, '');
    expect(items.map((i) => i.label).sort()).toEqual(Object.keys(snippets).sort());
  });

  it('filters by prefix', () => {
    const items = nornsSnippetCompletionItems(monacoStub, 'in');
    expect(items.map((i) => i.label)).toEqual(['init']);
  });

  it('uses snippet insert rules', () => {
    const [item] = nornsSnippetCompletionItems(monacoStub, 'init');
    expect(item.insertText).toBe(snippets.init.code);
    expect(item.insertTextRules).toBe(4);
    expect(item.kind).toBe(27);
    expect(item.detail).toBe('norns');
  });
});
