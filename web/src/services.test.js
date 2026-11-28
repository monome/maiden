import {
  languageIdForFileName,
  keyboardModeFromHandler,
  KEYBOARD_VIM,
  KEYBOARD_EMACS,
} from './services';

describe('languageIdForFileName', () => {
  it('maps known extensions', () => {
    expect(languageIdForFileName('/dust/code/script.lua')).toBe('lua');
    expect(languageIdForFileName('readme.md')).toBe('markdown');
    expect(languageIdForFileName('notes.markdown')).toBe('markdown');
    expect(languageIdForFileName('data.json')).toBe('json');
    expect(languageIdForFileName('config.yaml')).toBe('yaml');
    expect(languageIdForFileName('config.yml')).toBe('yaml');
    expect(languageIdForFileName('run.sh')).toBe('shell');
    expect(languageIdForFileName('run.bash')).toBe('shell');
  });

  it('is case-insensitive on the extension', () => {
    expect(languageIdForFileName('Script.LUA')).toBe('lua');
    expect(languageIdForFileName('Data.JSON')).toBe('json');
  });

  it('falls back to plaintext', () => {
    expect(languageIdForFileName(undefined)).toBe('plaintext');
    expect(languageIdForFileName('')).toBe('plaintext');
    expect(languageIdForFileName('Makefile')).toBe('plaintext');
    expect(languageIdForFileName('sound.scd')).toBe('plaintext');
  });
});

describe('keyboardModeFromHandler', () => {
  it('maps persisted ace handler ids', () => {
    expect(keyboardModeFromHandler(null)).toBe('default');
    expect(keyboardModeFromHandler(undefined)).toBe('default');
    expect(keyboardModeFromHandler(KEYBOARD_VIM)).toBe('vim');
    expect(keyboardModeFromHandler(KEYBOARD_EMACS)).toBe('emacs');
  });
});
