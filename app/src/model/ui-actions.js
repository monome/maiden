export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE'
export const SIDEBAR_SIZE = 'SIDEBAR_SIZE'

export const REPL_TOGGLE = 'REPL_TOGGEL'
export const REPL_SIZE = 'REPL_SIZE'

//
// sync actions
//

export const sidebarToggle = () => {
    return { type: SIDEBAR_TOGGLE }
}

export const sidebarSize = (width) => {
    return { type: SIDEBAR_SIZE, width }
}

export const replToggle = () => {
    return { type: REPL_TOGGLE }
}

export const replSize = (height) => {
    return { type: REPL_SIZE, height }
}