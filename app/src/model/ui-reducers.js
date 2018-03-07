import {
    SIDEBAR_TOGGLE,
    SIDEBAR_SIZE,
    REPL_TOGGLE,
    REPL_SIZE,
} from './ui-actions';

/*

ui: {
    hidden: <bool>,
    width: <int>,
}

*/

const initialState = {
    sidebarHidden: false,
    sidebarWidth: 250,
    sidebarMinWidth: 210,
    sidebarMaxWidth: 500,
    replHidden: false,
    replHeight: 120,
    replMinHeight: 100,
}

const ui = (state = initialState, action) => {
    switch (action.type) {
    case SIDEBAR_TOGGLE:
        return {...state, sidebarHidden: !state.sidebarHidden};

    case SIDEBAR_SIZE:
        return {...state, sidebarWidth: action.width};

    case REPL_TOGGLE:
        return {...state, replHidden: !state.replHidden};

    case REPL_SIZE:
        return {...state, replHeight: action.height};

    default:
        return state;
    }
}

export default ui;