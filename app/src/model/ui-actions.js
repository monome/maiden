import { REPL_COMPONENT, SIDEBAR_COMPONENT } from '../constants';

export const TOGGLE_COMPONENT = 'TOGGLE_COMPONENT'

export const SIDEBAR_SIZE = 'SIDEBAR_SIZE'
export const REPL_SIZE = 'REPL_SIZE'

//
// sync actions
//

export const toggleComponent = (name) => {
    return { type: TOGGLE_COMPONENT, name }
}

export const sidebarToggle = () => {
    return { type: TOGGLE_COMPONENT, name: SIDEBAR_COMPONENT }
}

export const sidebarSize = (width) => {
    return { type: SIDEBAR_SIZE, width }
}

export const replToggle = () => {
    return { type: TOGGLE_COMPONENT, name: REPL_COMPONENT }
}

export const replSize = (height) => {
    return { type: REPL_SIZE, height }
}