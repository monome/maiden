import api from './api';

it('no sibling returns something', () => {
  const r = api.siblingResourceForName('untitled.lua');
  expect(r).toEqual('/api/v1/scripts/untitled.lua');
});

it('should escape filename', () => {
  const r = api.siblingResourceForName('one two.lua');
  expect(r).toEqual('/api/v1/scripts/one%20two.lua');
});

it('root sibling should match no sibling', () => {
  const r = api.siblingResourceForName('untitled.lua');
  const q = api.siblingResourceForName('untitled.lua', '/api/v1/scripts/foo.lua');
  expect(q).toEqual(r);
});

it('non-root sibling works', () => {
  const r = api.siblingResourceForName('foo.lua', '/api/v1/scripts/one/two/three.lua');
  expect(r).toEqual('/api/v1/scripts/one/two/foo.lua');
});

// TODO: add tests for fileFromResource
