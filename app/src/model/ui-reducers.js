import {
    SIDEBAR_TOGGLE,
    SIDEBAR_SIZE,
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
}

const ui = (state = initialState, action) => {
    switch (action.type) {
    case SIDEBAR_TOGGLE:
        return {...state, sidebarHidden: !state.sidebarHidden};

    case SIDEBAR_SIZE:
        return {...state, sidebarWidth: action.width};

    default:
        return state;
    }
}

export default ui;