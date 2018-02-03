import React from 'react';

const ReplActivity = (props) => {
    const style = {
        display: "flex",
        ...props.size,
    };

    return (
        <div className="repl-activity" style={style}>
            ...this is the repl...
        </div>
    );
};

export default ReplActivity;