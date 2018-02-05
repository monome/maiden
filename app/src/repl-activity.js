import React from 'react';
import Repl from './repl';

const ReplActivity = (props) => {
    // const size = { 
        // height: props.height,
        // width: props.width,
    // };
    return (
        <Repl {...props}/>
        // <div>foobar...</div>
    );
};

export default ReplActivity;