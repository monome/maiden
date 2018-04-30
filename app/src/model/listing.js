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
                return acc
            }
            if (node.get('url') === resource) {
                return new List([key])
            }
            let children = node.get('children')
            if (children) {
                let childKey = walk(children, acc)
                if (childKey) {
                    return childKey.unshift(key, 'children')
                }
            }
            return acc
        }, undefined);
    }

    return walk(listing, undefined);
}

export const nodeForResource = (rootNodes, resource) => {
    let keyPath = keyPathForResource(rootNodes, resource)
    if (keyPath) {
        return rootNodes.getIn(keyPath)
    }
    return undefined
}

export const keyPathParent = (keyPath) => {
    if (keyPath && keyPath.size > 2) {
        return keyPath.pop().pop();
    }
    return undefined;
}

export const parentNodeForResource = (listing, resource) => {
    let keyPath = keyPathForResource(listing, resource);
    if (keyPath && keyPath.length > 2) {
        return listing.getIn(keyPath.pop().pop());
    }
    return undefined;
}

export const listingReduce = (listing, reduceFn, initial = undefined) => {
    const walk = (nodes, acc) => {
        if (!nodes) {
            return acc;
        }
        return nodes.reduce((acc, node, key) => {
            return reduceFn(walk(node.get("children"), acc), node);
        }, acc);
    }
    return walk(listing, initial);
}

export const spliceDirInfo = (listing, target, info) => {
    let path = keyPathForResource(listing, target)
    if (path) {
        path = path.push('children');
        info = muxInVirtualNodes(listing.getIn(path), info).sort(orderByName)
        return listing.setIn(path, info)
    }
    console.log("unable to find resource in listing, ")
    return listing
}

export const spliceFileInfo = (listing, node, siblingResource, categoryIndex = 0) => {
    // by default if no sibling just insert at top of hierarchy
    let siblingFamily = new List([categoryIndex, "children"]) // assumes virtual root node
    let newIndex = [0]

    let siblingPath = keyPathForResource(listing, siblingResource)
    if (siblingPath) {
        siblingFamily = siblingPath.pop()      // path to children of sibling parent
        newIndex = siblingPath.last() + 1;     // insert new node just after sibling
    }

    let children = listing.getIn(siblingFamily).insert(newIndex, node)

    // for now we sort the children by name but in the future this will probably be broken out into a separate function so that the new node can be inserted into a specific position (with name still editable) then sort when the name is confirmed
    let sorted = children.sort(orderByName);

    return listing.setIn(siblingFamily, sorted)
}

// MAINT: this assumes a listing with a rootNode node
export const sortDir = (rootNodes, dirPath) => {
    // let dirPath = keyPathForResource(rootNodes, resource);
    if (dirPath) {
        let dirNode = rootNodes.getIn(dirPath);
        let children = dirNode.get("children");
        let sorted = children.sort(orderByName)
        return rootNodes.setIn(dirPath.push("children"), sorted)
    }
    return rootNodes;
}

export const spliceNodes = (rootNodes, nodes) => {
    if (!nodes) {
        return rootNodes;
    }

    return nodes.reduce((acc, node, key) => {
        let url = node.get("url");
        let parsed = parsePath(url);
        let keyPath = keyPathForResource(acc, parsed.dir);
        // console.log("url => keyPath //", url, parsed.dir, keyPath)
        if (keyPath) {
            let siblingPath = keyPath.push("children")
            let children = acc.getIn(siblingPath)
            let matches = children.find((c) => {
                return (url === c.get("url"))
            });
            if (matches === undefined) {
                // this node isn't in the listing, add
                return acc.setIn(siblingPath, children.push(node).sort(orderByName));
            }
        }
        else {
            //return acc.push(node)
            console.log("danger will robinson, node parent path cannot be found", node)
        }

        // nothing inserted
        return acc;
    }, rootNodes)
}

export const orderByName = (a, b) => {
    let na = a.get('name')
    let nb = b.get('name')

    if (na < nb) {
        return -1;
    }
    if (na > nb) {
        return 1;
    }
    return 0;
}

// take a list of nodes (script/dir info objects) and return a set containing all the names used at that top level
export const getNodeNames = (nodes) => {
    return new Set(nodes.map(node => node.get('name')));
}

export const getNodeByName = (nodes, name) => {
    return nodes.find(n => n.get("name") === name)
}

// given a set of existing names and [optionally] an exemplar generate a new name which isn't taken by adding a number at the end of the name
export const generateNodeName = (siblingNodes, exemplar = 'untitled.lua') => {
    let existing = getNodeNames(siblingNodes)

    if (!existing.has(exemplar)) {
        return exemplar;
    }

    let num = 1;
    let parsed = parsePath(exemplar);
    let nameRoot = parsed.name;

    // refine starting point if possible
    let match = nameRoot.split(/(\d+)$/)
        if (match && match.length === 3) {
        nameRoot = match[0]
        num = parseInt(match[1], 10);
    }

    var name;
    do {
        name = nameRoot + num + parsed.ext;
        num += 1;
    } while (existing.has(name));

    return name;
}

export const virtualNode = (name, resource, children = undefined) => {
    if (children) {
        return new Map({ name, url: resource, children, virtual: true })
    }
    return new Map({ name, url: resource, virtual: true })
}

// FIXME: this should not return a List
export const virtualRoot = (children, name = "ROOT") => {
    let rootNodes = fromJS([{ name, url: "/", virtual: true }])
    return rootNodes.setIn([0, "children"], children)
}

export const collectVirtualNodes = (listing) => {
    const reducer = (acc, node) => {
        if (node.get("virtual")) {
            return acc.push(node);
        }
        return acc;
    }
    return listingReduce(listing, reducer, new List());
}

// append new nodes into base list if they are new (no sorting)
export const appendNodes = (base, additions) => {
    let keys = new Set(base.map(n => n.get("url")))
    let adds = additions.filterNot(n => keys.has(n.get("url")))
    return base.push(...adds)
}

export const muxInVirtualNodes = (base, incoming) => {
    let keys = new Set(incoming.map(n => n.get("url")))
    let virtuals = base.filter(n => n.get("virtual", false) && !keys.has(n.get("url")))
    return incoming.push(...virtuals)
}

export const childrenOfRoot = (rootNodes, index = 0) => {
    return rootNodes.getIn([index, "children"]);
}

export const rootCategoryIndex = (rootNodes, category) => {
    return rootNodes.findIndex(n => n.get("name") === category);
}

export const siblingNamesForResource = (rootNodes, resource) => {
    let keyPath = keyPathForResource(rootNodes, resource);
    if (!keyPath.has("children")) {
        // this is a script/file itself, get sibling names by listing the parent node
        keyPath = keyPathParent(keyPath)
    }
    let node = rootNodes.getIn(keyPath)
    return new Set(node.get("children").map(node => node.get("name")))
}