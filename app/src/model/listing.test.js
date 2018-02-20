import { Map, List, fromJS } from 'immutable';
import { 
    keyPathForResource, 
    nodeForResource,
    generateNodeName,
} from './listing';

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

it('existing node is found', () => {
    let r1 = nodeForResource(listing, '/d2/f3')
    expect(r1).toEqual(new Map({ name: 'f3', url: '/d2/f3' }))

    let r2 = nodeForResource(listing, '/d2/d4')
    expect(r2.get('children').size).toEqual(1)
})

it('non-existant resource lookup should return undefined', () => {
    expect(nodeForResource(listing, '*MISSING')).toEqual(undefined)
})

// TODO: add tests for spliceDirInfo
// TODO: add tests for spliceFileInfo

let siblings = fromJS([
    { name: "a.lua"},
    { name: "a3.lua"},
    { name: "a4.lua"},
    { name: "b3123a.lua" },
    { name: "c1234a9.lua" },
    { name: "c1234-9.lua" },
])

it('generate should use name if no collision', () => {
    let r = generateNodeName(siblings, "untitled.lua")
    expect(r).toEqual("untitled.lua")
})

it('generate should pick next available hole', () => {
    let r1 = generateNodeName(siblings, "a.lua")
    expect(r1).toEqual("a1.lua")

    let r2 = generateNodeName(siblings, "a3.lua")
    expect(r2).toEqual("a5.lua")
})

it('generate should increment based on only the trailing digits', () => {
    let r1 = generateNodeName(siblings, "b3123a.lua")
    expect(r1).toEqual("b3123a1.lua")

    let r2 = generateNodeName(siblings, "c1234a9.lua")
    expect(r2).toEqual("c1234a10.lua")

    let r3 = generateNodeName(siblings, "c1234-9.lua")
    expect(r3).toEqual("c1234-10.lua")
})

