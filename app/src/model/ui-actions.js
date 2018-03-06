export const SIDEBAR_TOGGLE = 'SIDEBAR_TOGGLE'
export const SIDEBAR_SIZE = 'SIDEBAR_SIZE'

//
// sync actions
//

export const sidebarToggle = () => {
    return { type: SIDEBAR_TOGGLE }
}

export const sidebarSize = (width) => {
    return { type: SIDEBAR_SIZE, width }
}