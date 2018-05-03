import {
  SIDEBAR_SIZE,
  REPL_SIZE,
  TOGGLE_COMPONENT,
} from './ui-actions';
import { SIDEBAR_COMPONENT, REPL_COMPONENT } from '../constants';

/*

ui: {
    hidden: <bool>,
    width: <int>,
}

*/

const initialState = {
  sidebarHidden: false,
  sidebarWidth: 250,
  sidebarMinWidth: 220,
  sidebarMaxWidth: 500,
  replHidden: false,
  replHeight: 160,
  replMinHeight: 100,
};

const ui = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_COMPONENT:
      return handleToggleComponent(state, action);

    case SIDEBAR_SIZE:
      return { ...state, sidebarWidth: action.width };

    case REPL_SIZE:
      return { ...state, replHeight: action.height };

    default:
      return state;
  }
};

const handleToggleComponent = (state, action) => {
  switch (action.name) {
    case SIDEBAR_COMPONENT:
      return { ...state, sidebarHidden: !state.sidebarHidden };

    case REPL_COMPONENT:
      return { ...state, replHidden: !state.replHidden };

    default:
      return state;
  }
};

export default ui;
