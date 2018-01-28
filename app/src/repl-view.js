import React from 'react';

const ReplView = (props) => {
    const style = {
        display: "flex",
        ...props.size,
    };

    return (
        <div className="repl-view" style={style}>
            ...this is the repl...
        </div>
    );
};

export default ReplView;