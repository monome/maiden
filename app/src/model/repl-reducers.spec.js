import { List } from 'immutable';
import { outputAppend } from './repl-reducers';

describe('outputAppend', () => {
  it('Appends a new value to the buffer', () => {
    const buffer = List([1, 2, 3, 4]);
    expect(outputAppend(buffer, 10, 5)).toEqual(List([1, 2, 3, 4, 5]));
  });

  describe('when the new buffer would exceed the limit', () => {
    it('discards the first value in the buffer', () => {
      const buffer = List([1, 2, 3, 4]);
      expect(outputAppend(buffer, 4, 5)).toEqual(List([2, 3, 4, 5]));
    });
  });
});
