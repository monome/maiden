import { REPL_COMPONENT, SIDEBAR_COMPONENT } from '../constants';

export const TOGGLE_COMPONENT = 'TOGGLE_COMPONENT';

export const SIDEBAR_SIZE = 'SIDEBAR_SIZE';
export const REPL_SIZE = 'REPL_SIZE';

//
// sync actions
//

export const toggleComponent = name => ({ type: TOGGLE_COMPONENT, name });

export const sidebarToggle = () => ({ type: TOGGLE_COMPONENT, name: SIDEBAR_COMPONENT });

export const sidebarSize = width => ({ type: SIDEBAR_SIZE, width });

export const replToggle = () => ({ type: TOGGLE_COMPONENT, name: REPL_COMPONENT });

export const replSize = height => ({ type: REPL_SIZE, height });
