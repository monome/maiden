import { siblingResourceForName } from './api';

it('no sibling returns something', () => {
  const r = siblingResourceForName('untitled.lua');
  expect(r).toEqual('/api/v1/scripts/untitled.lua');
});

it('should escape filename', () => {
  const r = siblingResourceForName('one two.lua');
  expect(r).toEqual('/api/v1/scripts/one%20two.lua');
});

it('root sibling should match no sibling', () => {
  const r = siblingResourceForName('untitled.lua');
  const q = siblingResourceForName('untitled.lua', '/api/v1/scripts/foo.lua');
  expect(q).toEqual(r);
});

it('non-root sibling works', () => {
  const r = siblingResourceForName('foo.lua', '/api/v1/scripts/one/two/three.lua');
  expect(r).toEqual('/api/v1/scripts/one/two/foo.lua');
});

// TODO: add tests for fileFromResource
