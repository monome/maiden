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
    hidden: false,
    width: 250,
    minWidth: 210,
    maxWidth: 500,
}

const ui = (state = initialState, action) => {
    switch (action.type) {
    case SIDEBAR_TOGGLE:
        return {...state, hidden: !state.hidden};

    case SIDEBAR_SIZE:
        return {...state, width: action.width};

    default:
        return state;
    }
}

export default ui;