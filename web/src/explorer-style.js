export default {
  tree: {
    base: {
      listStyle: 'none',
      backgroundColor: 'var(--neutral-background-default)',
      margin: 0,
      padding: 0,
      color: 'var(--neutral-medium-default)',
      // overflow: 'scroll',
      // height: '100%',
    },
    node: {
      base: {
        position: 'relative',
      },
      // link: {
      //     cursor: 'pointer',
      //     position: 'relative',
      //     padding: '0px 5px',
      //     display: 'block'
      // },
      // activeLink: {
      //     background: '#E0E7F1'
      // },
      container: {
        marginLeft: '13px',
      },
      toggle: {
        base: {
          position: 'relative',
          // display: 'inline-block',
          verticalAlign: 'top',
          marginLeft: '-8px',
        },
        height: 8,
        width: 8,
        arrow: {
          fill: 'var(--neutral-medium-default)',
          strokeWidth: 0,
        },
      },
      header: {
        base: {
          color: 'var(--neutral-medium-default)',
        },
        connector: {},
        title: {
          lineHeight: '24px',
          verticalAlign: 'middle',
        },
      },
      subtree: {
        listStyle: 'none',
        paddingLeft: '14px',
      },
      loading: {
        color: 'var(--accent1-background-default)',
      },
    },
  },
};
