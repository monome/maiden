export default {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: '#F9F9F9',
            margin: 0,
            padding: 0,
            color: '#90',
            // fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
            // fontSize: '14px'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '0px 5px',
                display: 'block'
            },
            activeLink: {
                background: '#E0E7F1'
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '3px',
                    height: '8px',
                    width: '10px'
                },
                wrapper: {
                    // position: 'absolute',
                    // top: '50%',
                    // left: '50%',
                    // margin: '-7px 0 0 -7px',
                    // margin: '-4px 0 0 -4px',
                    // height: '14px'
                    // height: '8px'
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
                    display: 'inline-block',
                    verticalAlign: 'top',
                    color: '#9DA5AB'
                },
                connector: {
                    width: '2px',
                    height: '12px',
                    borderLeft: 'solid 2px black',
                    borderBottom: 'solid 2px black',
                    position: 'absolute',
                    top: '0px',
                    left: '-21px'
                },
                title: {
                    lineHeight: '24px',
                    verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
            },
            loading: {
                color: '#E2C089'
            }
        }
    }
};
