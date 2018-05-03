import { siblingScriptResourceForName } from './api';

it('no sibling returns something', () => {
  const r = siblingScriptResourceForName('untitled.lua');
  expect(r).toEqual('/api/v1/scripts/untitled.lua');
});

it('should escape filename', () => {
  const r = siblingScriptResourceForName('one two.lua');
  expect(r).toEqual('/api/v1/scripts/one%20two.lua');
});

it('root sibling should match no sibling', () => {
  const r = siblingScriptResourceForName('untitled.lua');
  const q = siblingScriptResourceForName('untitled.lua', '/api/v1/scripts/foo.lua');
  expect(q).toEqual(r);
});

it('non-root sibling works', () => {
  const r = siblingScriptResourceForName('foo.lua', '/api/v1/scripts/one/two/three.lua');
  expect(r).toEqual('/api/v1/scripts/one/two/foo.lua');
});

// TODO: add tests for fileFromResource
