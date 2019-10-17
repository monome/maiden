import { Set } from 'immutable';

import { SIDEBAR_SIZE, REPL_SIZE, TOGGLE_COMPONENT, TOGGLE_CATEGORY } from './ui-actions';
import { SIDEBAR_COMPONENT, REPL_COMPONENT, CONFIG_COMPONENT } from '../constants';

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
  editorMinHeight: 100,
  configHidden: true,
  collapsedCategories: new Set(),
};

const handleToggleComponent = (state, action) => {
  switch (action.name) {
    case SIDEBAR_COMPONENT:
      return { ...state, sidebarHidden: !state.sidebarHidden };

    case REPL_COMPONENT:
      return { ...state, replHidden: !state.replHidden };
    
    case CONFIG_COMPONENT:
      return { ...state, configHidden: !state.configHidden }

    default:
      return state;
  }
};

const handleToggleCategory = (state, action) => {
  let newCollapsedCategories;

  if (state.collapsedCategories.has(action.name)) {
    newCollapsedCategories = state.collapsedCategories.delete(action.name);
  } else {
    newCollapsedCategories = state.collapsedCategories.add(action.name);
  }

  return { ...state, collapsedCategories: newCollapsedCategories };
};

const ui = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_COMPONENT:
      return handleToggleComponent(state, action);

    case TOGGLE_CATEGORY:
      return handleToggleCategory(state, action);

    case SIDEBAR_SIZE:
      return { ...state, sidebarWidth: action.width };

    case REPL_SIZE:
      return { ...state, replHeight: action.height };

    default:
      return state;
  }
};

export default ui;
