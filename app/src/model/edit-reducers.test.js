// import rewire from 'rewire';
import scripts from './edit-reducers';
import { virtualRoot } from './listing';

import { List, Map, Set } from 'immutable';

it('initial state should have empty collections', () => {
    let state = scripts(undefined, { type: '@@INIT' })
    expect(state.rootNodes).toEqual(virtualRoot(new List()))
    expect(state.buffers).toEqual(new Map())
    expect(state.expandedNodes).toEqual(new Set())
})

// TODO: figure out how to test the internal functions