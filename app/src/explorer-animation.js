export default {
    toggle: ({node: {toggled}}) => ({
        animation: {rotateZ: toggled ? 90 : 0},
        duration: 100
    }),
    drawer: (/* props */) => ({
        enter: {
            animation: 'slideDown',
            duration: 100
        },
        leave: {
            animation: 'slideUp',
            duration: 100
        }
    })
};
