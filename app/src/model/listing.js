import { Map, List, fromJS } from 'immutable';
import parsePath from 'parse-filepath';

export const keyPathForResource = (listing, resource) => {
  const walk = (nodes, acc) => {
    if (!nodes) {
      return acc;
    }

    return nodes.reduce((acc, node, key) => {
      if (acc) {
        // already found a match
        return acc;
      }
      if (node.get('url') === resource) {
        return new List([key]);
      }
      const children = node.get('children');
      if (children) {
        const childKey = walk(children, acc);
        if (childKey) {
          return childKey.unshift(key, 'children');
        }
      }
      return acc;
    }, undefined);
  };

  return walk(listing, undefined);
};

export const nodeForResource = (rootNodes, resource) => {
  const keyPath = keyPathForResource(rootNodes, resource);
  if (keyPath) {
    return rootNodes.getIn(keyPath);
  }
  return undefined;
};

export const keyPathParent = keyPath => {
  if (keyPath && keyPath.size > 2) {
    return keyPath.pop().pop();
  }
  return undefined;
};

export const parentNodeForResource = (listing, resource) => {
  const keyPath = keyPathForResource(listing, resource);
  if (keyPath && keyPath.length > 2) {
    return listing.getIn(keyPath.pop().pop());
  }
  return undefined;
};

export const listingReduce = (listing, reduceFn, initial = undefined) => {
  const walk = (nodes, acc) => {
    if (!nodes) {
      return acc;
    }
    return nodes.reduce((acc, node, key) => reduceFn(walk(node.get('children'), acc), node), acc);
  };
  return walk(listing, initial);
};

export const spliceDirInfo = (listing, target, info) => {
  let path = keyPathForResource(listing, target);
  if (path) {
    path = path.push('children');
    info = muxInVirtualNodes(listing.getIn(path), info).sort(orderByTypeThenName);
    return listing.setIn(path, info);
  }
  console.log('unable to find resource in listing, ');
  return listing;
};

export const spliceFileInfo = (listing, node, siblingResource, categoryIndex = 0) => {
  // by default if no sibling just insert at top of hierarchy
  let siblingFamily = new List([categoryIndex, 'children']); // assumes virtual root node
  // let newIndex = [0];

  const siblingPath = keyPathForResource(listing, siblingResource);
  if (siblingPath) {
    const siblingPathNode = listing.getIn(siblingPath);
    if (nodeIsDir(siblingPathNode)) {
      siblingFamily = siblingPath.push('children');
      // newIndex =
    } else {
      siblingFamily = siblingPath.pop(); // path to children of sibling parent
      // newIndex = siblingPath.last() + 1; // insert new node just after sibling
    }
  }

  // const children = listing.getIn(siblingFamily).insert(newIndex, node);
  const children = listing.getIn(siblingFamily).push(node);

  // for now we sort the children by name but in the future this will probably be broken out into a separate function so that the new node can be inserted into a specific position (with name still editable) then sort when the name is confirmed
  const sorted = children.sort(orderByTypeThenName);

  return listing.setIn(siblingFamily, sorted);
};

// MAINT: this assumes a listing with a rootNode node
export const sortDir = (rootNodes, dirPath) => {
  // let dirPath = keyPathForResource(rootNodes, resource);
  if (dirPath) {
    const dirNode = rootNodes.getIn(dirPath);
    const children = dirNode.get('children');
    const sorted = children.sort(orderByTypeThenName);
    return rootNodes.setIn(dirPath.push('children'), sorted);
  }
  return rootNodes;
};

export const spliceNodes = (rootNodes, nodes) => {
  if (!nodes) {
    return rootNodes;
  }

  return nodes.reduce((acc, node, key) => {
    const url = node.get('url');
    const parsed = parsePath(url);
    const keyPath = keyPathForResource(acc, parsed.dir);
    // console.log("url => keyPath //", url, parsed.dir, keyPath)
    if (keyPath) {
      const siblingPath = keyPath.push('children');
      const children = acc.getIn(siblingPath);
      const matches = children.find(c => url === c.get('url'));
      if (matches === undefined) {
        // this node isn't in the listing, add
        return acc.setIn(siblingPath, children.push(node).sort(orderByTypeThenName));
      }
    } else {
      // return acc.push(node)
      console.log('danger will robinson, node parent path cannot be found', node);
    }

    // nothing inserted
    return acc;
  }, rootNodes);
};

export const orderByName = (a, b) => {
  const na = a.get('name');
  const nb = b.get('name');

  if (na < nb) {
    return -1;
  }
  if (na > nb) {
    return 1;
  }
  return 0;
};

export const orderByTypeThenName = (a, b) => {
  const na = a.get('name');
  const aIsDir = a.get('children') !== undefined;
  const nb = b.get('name');
  const bIsDir = b.get('children') !== undefined;

  // console.log("a:", na, aIsDir, "b:", nb, bIsDir);

  // sort directories first in the list
  if (aIsDir && !bIsDir) {
    return -1;
  }
  if (bIsDir && !aIsDir) {
    return 1;
  }

  // both are either file or dir, sort by name 
  if (na < nb) {
    return -1;
  }
  if (na > nb) {
    return 1;
  }
  return 0;

};

// take a list of nodes (script/dir info objects) and return a set containing all the names used at that top level
export const getNodeNames = nodes => new Set(nodes.map(node => node.get('name')));

export const getNodeByName = (nodes, name) => nodes.find(n => n.get('name') === name);

// given a set of existing names and [optionally] an exemplar generate a new name which isn't taken by adding a number at the end of the name
export const generateNodeName = (siblingNodes, exemplar = 'untitled.lua') => {
  const existing = getNodeNames(siblingNodes);

  if (!existing.has(exemplar)) {
    return exemplar;
  }

  let num = 1;
  const parsed = parsePath(exemplar);
  let nameRoot = parsed.name;

  // refine starting point if possible
  const match = nameRoot.split(/(\d+)$/);
  if (match && match.length === 3) {
    nameRoot = match[0];
    num = parseInt(match[1], 10);
  }

  let name;
  do {
    name = nameRoot + num + parsed.ext;
    num += 1;
  } while (existing.has(name));

  return name;
};

export const nodeIsDir = node => node.has('children');

export const directoryNode = (name, resource, children = []) =>
  new Map({ name, url: resource, children });

export const virtualNode = (name, resource, children = undefined) => {
  if (children) {
    return new Map({
      name,
      url: resource,
      children,
      virtual: true,
    });
  }
  return new Map({ name, url: resource, virtual: true });
};

// FIXME: this should not return a List
export const virtualRoot = (children, name = 'ROOT') => {
  const rootNodes = fromJS([{ name, url: '/', virtual: true }]);
  return rootNodes.setIn([0, 'children'], children);
};

export const collectVirtualNodes = listing => {
  const reducer = (acc, node) => {
    if (node.get('virtual')) {
      return acc.push(node);
    }
    return acc;
  };
  return listingReduce(listing, reducer, new List());
};

// append new nodes into base list if they are new (no sorting)
export const appendNodes = (base, additions) => {
  const keys = new Set(base.map(n => n.get('url')));
  const adds = additions.filterNot(n => keys.has(n.get('url')));
  return base.push(...adds);
};

export const muxInVirtualNodes = (base, incoming) => {
  const keys = new Set(incoming.map(n => n.get('url')));
  const virtuals = base.filter(n => n.get('virtual', false) && !keys.has(n.get('url')));
  return incoming.push(...virtuals);
};

export const childrenOfRoot = (rootNodes, index = 0) => rootNodes.getIn([index, 'children']);

export const rootCategoryIndex = (rootNodes, category) =>
  rootNodes.findIndex(n => n.get('name') === category);

export const siblingNamesForResource = (rootNodes, resource) => {
  // if resource is a file, returns the names of sibling files
  // if resource is a dir, returns name of dir children
  const keyPath = keyPathForResource(rootNodes, resource);
  let node = rootNodes.getIn(keyPath);
  if (!node.has('children')) {
    // this is a script/file itself, get sibling names by listing the parent node
    node = rootNodes.getIn(keyPathParent(keyPath));
  }
  const names = new Set(node.get('children').map(node => node.get('name')));
  // console.log("sibs: ", names);
  return names;
};
