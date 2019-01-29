import { Map, List, fromJS } from 'immutable';
import {
  keyPathForResource,
  nodeForResource,
  generateNodeName,
  appendNodes,
  collectVirtualNodes,
  spliceNodes,
  keyPathParent,
  virtualRoot,
  orderByName,
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
            url: '/d2/d4/f5',
          },
        ],
      },
    ],
  },
  {
    name: 'f6',
    url: '/f6',
  },
]);

const root = virtualRoot(listing);

it('root matches should return path with single index', () => {
  expect(keyPathForResource(root, '/f1')).toEqual(new List([0, 'children', 0]));
  expect(keyPathForResource(root, '/d2')).toEqual(new List([0, 'children', 1]));
  expect(keyPathForResource(root, '/f6')).toEqual(new List([0, 'children', 2]));
  expect(keyPathForResource(root, '/missing')).toEqual(undefined);
});

it('level one child should be [index, "children", index]', () => {
  expect(keyPathForResource(root, '/d2/d4')).toEqual(new List([0, 'children', 1, 'children', 1]));
  expect(keyPathForResource(root, '/d2/f3')).toEqual(new List([0, 'children', 1, 'children', 0]));
  expect(keyPathForResource(root, '/d2/missing')).toEqual(undefined);
});

it('level two children should have five element path', () => {
  const expected = new List([0, 'children', 1, 'children', 1, 'children', 0]);
  expect(keyPathForResource(root, '/d2/d4/f5')).toEqual(expected);
});

it('existing node is found', () => {
  const r1 = nodeForResource(root, '/d2/f3');
  expect(r1).toEqual(new Map({ name: 'f3', url: '/d2/f3' }));

  const r2 = nodeForResource(root, '/d2/d4');
  expect(r2.get('children').size).toEqual(1);
});

it('non-existant resource lookup should return undefined', () => {
  expect(nodeForResource(root, '*MISSING')).toEqual(undefined);
});

it('parent path of top level is undefined', () => {
  const kp = keyPathForResource(root, '/f1');
  expect(kp).toEqual(new List([0, 'children', 0]));
  expect(keyPathParent(kp)).toEqual(new List([0]));
});

it('parent path of undefined is undefined', () => {
  expect(keyPathParent(undefined)).toEqual(undefined);
});

// TODO: add tests for spliceDirInfo
// TODO: add tests for spliceFileInfo

const siblings = fromJS([
  { name: 'a.lua' },
  { name: 'a3.lua' },
  { name: 'a4.lua' },
  { name: 'b3123a.lua' },
  { name: 'c1234a9.lua' },
  { name: 'c1234-9.lua' },
]);

it('generate should use name if no collision', () => {
  const r = generateNodeName(siblings, 'untitled.lua');
  expect(r).toEqual('untitled.lua');
});

it('generate should pick next available hole', () => {
  const r1 = generateNodeName(siblings, 'a.lua');
  expect(r1).toEqual('a1.lua');

  const r2 = generateNodeName(siblings, 'a3.lua');
  expect(r2).toEqual('a5.lua');
});

it('generate should increment based on only the trailing digits', () => {
  const r1 = generateNodeName(siblings, 'b3123a.lua');
  expect(r1).toEqual('b3123a1.lua');

  const r2 = generateNodeName(siblings, 'c1234a9.lua');
  expect(r2).toEqual('c1234a10.lua');

  const r3 = generateNodeName(siblings, 'c1234-9.lua');
  expect(r3).toEqual('c1234-10.lua');
});

const existing = fromJS([
  { name: 'a.lua', url: '/a.lua' },
  { name: 'untitled.lua', url: '/untitled.lua' },
]);

const adds = fromJS([{ name: 'b.lua', url: '/b.lua' }, { name: 'a.lua', url: '/a.lua' }]);

it('append of empty list should be a no-op', () => {
  expect(appendNodes(existing, new List())).toEqual(existing);
});

it('append of existing should be a no-op', () => {
  const n1 = fromJS([{ name: 'a.lua', url: '/a.lua' }]);
  expect(appendNodes(existing, n1)).toEqual(existing);

  const n2 = fromJS([{ name: 'untitled.lua', url: '/untitled.lua' }]);
  expect(appendNodes(existing, n2)).toEqual(existing);
});

it('append should just add only new', () => {
  const r1 = fromJS([
    { name: 'a.lua', url: '/a.lua' },
    { name: 'untitled.lua', url: '/untitled.lua' },
    { name: 'b.lua', url: '/b.lua' },
  ]);
  expect(appendNodes(existing, adds)).toEqual(r1);
});

const virtListing = fromJS([
  { name: 'a.lua', url: '/a.lua' },
  { name: 'untitled.lua', url: '/untitled.lua', virtual: true },
  {
    name: 'foo',
    url: '/foo',
    children: [
      {
        name: 'bar',
        url: '/foo/bar',
        children: [{ name: 'baz.lua', url: '/foo/bar/baz.lua', virtual: true }],
      },
    ],
  },
]);

it('collect virtual does not return non virutal', () => {
  expect(collectVirtualNodes(listing)).toEqual(new List());
  expect(collectVirtualNodes(siblings)).toEqual(new List());
});

it('collect virtual finds top and children', () => {
  const r = fromJS([
    { name: 'untitled.lua', url: '/untitled.lua', virtual: true },
    { name: 'baz.lua', url: '/foo/bar/baz.lua', virtual: true },
  ]);
  expect(collectVirtualNodes(virtListing)).toEqual(r);
});

it('splice nodes works on all levels', () => {
  const n0 = fromJS({ name: 'n0.lua', url: '/n0.lua' });
  const n1 = fromJS({ name: 'n1.lua', url: '/foo/n1.lua' });
  const n2 = fromJS({ name: 'n2.lua', url: '/foo/bar/n2.lua' });

  const root = virtualRoot(
    fromJS([
      { name: 'a.lua', url: '/a.lua' },
      {
        name: 'foo',
        url: '/foo',
        children: [
          {
            name: 'bar',
            url: '/foo/bar',
            children: [{ name: 'baz.lua', url: '/foo/bar/baz.lua', virtual: true }],
          },
        ],
      },
      // commenting this out since it complicates producing the r0 result since insertIn isn't a provided method and splicing sorts the listing
      // { name: "untitled.lua", url: "/untitled.lua", virtual: true },
    ]),
  );

  // expect(spliceNodes(new List(), new List([n0]))).toEqual(new List([n0]))

  const r0 = root.setIn([0, 'children', 2], n0);
  expect(spliceNodes(root, new List([n0]))).toEqual(r0);

  // splice in existing is a no-op
  expect(spliceNodes(root, fromJS([{ name: 'bar', url: '/foo/bar' }]))).toEqual(root);

  const r1 = root.setIn([0, 'children', 1, 'children', 1], n1);
  expect(spliceNodes(root, new List([n1]))).toEqual(r1);

  const r2 = root.setIn([0, 'children', 1, 'children', 0, 'children', 1], n2);
  expect(spliceNodes(root, new List([n2]))).toEqual(r2);
});

it('splice nodes works for directories', () => {
  const d0 = fromJS({ name: 'd0', url: '/d0', children: [] });
  const d1 = fromJS({ name: 'd1', url: '/foo/d1', children: [] });

  const root = virtualRoot(
    fromJS([
      { name: 'a.lua', url: '/a.lua' },
      {
        name: 'foo',
        url: '/foo',
        children: [],
      },
    ]),
  );

  const c0 = root
    .getIn([0, 'children'])
    .push(d0)
    .sort(orderByName);
  const r0 = root.setIn([0, 'children'], c0);
  expect(spliceNodes(root, new List([d0]))).toEqual(r0);

  const c1 = root
    .getIn([0, 'children', 1, 'children'])
    .push(d1)
    .sort(orderByName);
  const r1 = root.setIn([0, 'children', 1, 'children'], c1);
  expect(spliceNodes(root, new List([d1]))).toEqual(r1);
});
