import React from 'react';

const Icon = (props) => {
  let viewBox = '0 0 32 32';
  let path = props.icon

  if (typeof props.icon === 'object') {
    // compound icon description
    viewBox = props.icon.box;
    path = props.icon.path;
  }

  const styles = {
    svg: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
    path: {
      fill: props.color,
    },
    ...props.style,
  };

  return (
    <svg
      style={styles.svg}
      width={`${props.size}px`}
      height={`${props.size}px`}
      viewBox={viewBox}
    >
      <path style={styles.path} d={path} />
    </svg>
  );
};

export default Icon;
