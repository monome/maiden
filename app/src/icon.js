import React from 'react';

const Icon = (props) => {
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

    // MAINT: render this portion of the svg, dependent on source SVG
    //const viewBox = `0 0 ${props.size} ${props.size}`;
    const viewBox = "0 0 32 32";

    return (
        <svg
            style={styles.svg}
            width={`${props.size}px`}
            height={`${props.size}px`}
            viewBox={viewBox}
        >
            <path style={styles.path} d={props.icon} />
        </svg>
    );
};

export default Icon;