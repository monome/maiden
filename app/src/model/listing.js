import { Map, List } from 'immutable';
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

export const spliceDirInfo = (listing, target, info) => {
    let path = keyPathForResource(listing, target)
    if (path) {
        return listing.setIn(path.push('children'), info)
    }
    console.log("unable to find resource in listing, ")
    return listing
}

export const spliceFileInfo = (listing, node, siblingResource) => {
    let siblingPath = keyPathForResource(listing, siblingResource)
    let siblingFamily = siblingPath.pop() // path to children of sibling parent
    
    // insert new node just after sibling
    let newIndex = siblingPath.last() + 1;
    let children = listing.getIn(siblingFamily).insert(newIndex, node)

    // for now we sort the children by name but in the future this will probably be broken out into a separate function so that the new node can be inserted into a specific position (with name still editable) then sort when the name is confirmed
    
    // FIXME: this isn't working for some reason
    let sorted = children.sort((a, b) => {
        let na = a.get('name')
        let nb = b.get('name')

        if (na < nb) {
            return -1
        }
        if (na > na) {
            return 1
        }
        return 0;
    })

    return listing.setIn(siblingFamily, sorted)
}

// take a list of nodes (script/dir info objects) and return a set containing all the names used at that top level
export const getNodeNames = (nodes) => {
    return new Set(nodes.map(node => node.get('name')));
}

// given a set of existing names and [optionally] an exemplar generate a new name which isn't taken by adding a number at the end of the name 
export const generateNodeName = (siblingNodes, exemplar = 'untitled.lua') => {
    let existing = getNodeNames(siblingNodes)

    if (!existing.has(exemplar)) {
        return exemplar;
    }

    let num = 1;
    let parsed = parsePath(exemplar);
    var name;
    do {
        name = parsed.name + num + parsed.ext;
        num += 1;
    } while (existing.has(name));

    return name;
}

export const listingNode = (name, resource) => {
    return new Map({ name, url: resource })
}
