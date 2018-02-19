import { Map, List, fromJS } from 'immutable';
import { keyPathForResource } from './listing';

// keyPath data
const listing = fromJS([
  {
      name: 'f1',
      url: '/f1',
  },
  {
      name: 'd2',
      url: '/d2',
      children: [
          {
              name: 'f3',
              url: '/d2/f3',
          },
          {
              name: 'd4',
              url: '/d2/d4',
              children: [
                  {
                      name: 'f5',
                      url: '/d2/d4/f5'
                  }
              ]
          },
      ]
  },
  {
      name: 'f6',
      url: '/f6'
  },
])

it('root matches should return path with single index', () => {
    expect(keyPathForResource(listing, '/f1')).toEqual(new List([0]))
    expect(keyPathForResource(listing, '/d2')).toEqual(new List([1]))
    expect(keyPathForResource(listing, '/f6')).toEqual(new List([2]))
})

it('level one child should be [index, "children", index]', () => {
    expect(keyPathForResource(listing, '/d2/d4')).toEqual(new List([1, 'children', 1]))
    expect(keyPathForResource(listing, '/d2/f3')).toEqual(new List([1, 'children', 0]))
})

it('level two children should have five element path', () => {
    let expected = new List([1, 'children', 1, 'children', 0])
    expect(keyPathForResource(listing, '/d2/d4/f5')).toEqual(expected)
})

// TODO: add tests for spliceDirInfo
// TODO: add tests for spliceFileInfo
// TODO: add tests for generateNodeName