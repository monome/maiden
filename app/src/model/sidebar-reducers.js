import {
    SIDEBAR_TOGGLE,
    SIDEBAR_SIZE,
} from './sidebar-actions';

/*

sidebar: {
    hidden: <bool>,
    width: <int>,
}

*/

const initialSidebarState = {
    hidden: false,
    width: 200,
}

const sidebar = (state = initialSidebarState, action) => {
    switch (action.type) {
    case SIDEBAR_TOGGLE:
        return {...state, hidden: !state.hidden};

    case SIDEBAR_SIZE:
        return {...state, width: action.width};

    default:
        return state;
    }
}

export default sidebar;