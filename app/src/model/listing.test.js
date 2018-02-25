import { Map, List, fromJS } from 'immutable';
import { 
    keyPathForResource, 
    nodeForResource,
    generateNodeName,
    appendNodes,
    collectVirtualNodes,
    spliceNodes,
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
    expect(keyPathForResource(listing, '/missing')).toEqual(undefined)
})

it('level one child should be [index, "children", index]', () => {
    expect(keyPathForResource(listing, '/d2/d4')).toEqual(new List([1, 'children', 1]))
    expect(keyPathForResource(listing, '/d2/f3')).toEqual(new List([1, 'children', 0]))
    expect(keyPathForResource(listing, '/d2/missing')).toEqual(undefined)
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


let existing = fromJS([
    { name: "a.lua", url: "/a.lua" },
    { name: "untitled.lua", url: "/untitled.lua", },
])

let adds = fromJS([
    { name: "b.lua", url: "/b.lua" },
    { name: "a.lua", url: "/a.lua" },
])

it('append of empty list should be a no-op', () => {
    expect(appendNodes(existing, new List())).toEqual(existing);
})

it('append of existing should be a no-op', () => {
    let n1 = fromJS([{ name: "a.lua", url: "/a.lua" }])
    expect(appendNodes(existing, n1)).toEqual(existing)

    let n2 = fromJS([{ name: "untitled.lua", url: "/untitled.lua" }])
    expect(appendNodes(existing, n2)).toEqual(existing)
})

it('append should just add only new', () => {
    let r1 = fromJS([
        { name: "a.lua", url: "/a.lua" },
        { name: "untitled.lua", url: "/untitled.lua" },
        { name: "b.lua", url: "/b.lua" },
    ])
    expect(appendNodes(existing, adds)).toEqual(r1)
})


let virtListing = fromJS([
    { name: "a.lua", url: "/a.lua" },
    { name: "untitled.lua", url: "/untitled.lua", virtual: true },
    { name: "foo", url: "/foo", children: [
        { name: "bar", url: "/foo/bar", children: [
            { name: "baz.lua", url: "/foo/bar/baz.lua", virtual: true },
        ]},
    ]}
])

it('collect virtual does not return non virutal', () => {
    expect(collectVirtualNodes(listing)).toEqual(new List())
    expect(collectVirtualNodes(siblings)).toEqual(new List())
})

it('collect virtual finds top and children', () => {
    let r = fromJS([
        { name: "untitled.lua", url: "/untitled.lua", virtual: true },
        { name: "baz.lua", url: "/foo/bar/baz.lua", virtual: true },
    ])
    expect(collectVirtualNodes(virtListing)).toEqual(r)
})

it('splice nodes works on all levels', () => {
    let n0 = fromJS({ name: "n0.lua", url: "/n0.lua" });
    let n1 = fromJS({ name: "n1.lua", url: "/foo/n1.lua" });
    let n2 = fromJS({ name: "n2.lua", url: "/foo/bar/n2.lua" });

    let listing = fromJS([
        { name: "a.lua", url: "/a.lua" },
        { name: "foo", url: "/foo", children: [
            { name: "bar", url: "/foo/bar", children: [
                { name: "baz.lua", url: "/foo/bar/baz.lua", virtual: true },
            ]},
        ]},
        // commenting this out since it complicates producing the r0 result since insertIn isn't a provided method and splicing sorts the listing
        // { name: "untitled.lua", url: "/untitled.lua", virtual: true },
    ])

    expect(spliceNodes(new List(), new List([n0]))).toEqual(new List([n0]))

    let r0 = listing.setIn([2], n0)
    expect(spliceNodes(listing, new List([n0]))).toEqual(r0)

    // splice in existing is a no-op
    expect(spliceNodes(listing, fromJS([{ name: "bar", url: "/foo/bar" }]))).toEqual(listing)

    let r1 = listing.setIn([1, "children", 1], n1)
    expect(spliceNodes(listing, new List([n1]))).toEqual(r1)

    let r2 = listing.setIn([1, "children", 0, "children", 1], n2)
    expect(spliceNodes(listing, new List([n2]))).toEqual(r2)
})

