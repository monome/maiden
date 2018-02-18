export default {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: '#F9F9F9',
            margin: 0,
            padding: 0,
            color: '#90',
        },
        node: {
            base: {
                position: 'relative'
            },
            container: {
                marginLeft: '13px',
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '-8px',
                },
                height: 8,
                width: 8,
                arrow: {
                    fill: '#9DA5AB',
                    strokeWidth: 0
                }
            },
            header: {
                base: {
                },
                connector: {
                },
                title: {
                    lineHeight: '24px',
                    verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '14px'
            },
            loading: {
                color: '#E2C089'
            }
        }
    }
};
