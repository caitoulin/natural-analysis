import React from 'react';
export interface HelloProps {
    compiler: string;
    framework: string;
}
const Hello = (props: HelloProps) => {
    const add = async () => {
        const getValue = await new Promise(function (resolve) {
            resolve(0);
            console.log('4');
        });
        console.log(getValue);
    };
    return (
        <h1 onClick={add}>
            Hello from {props.compiler} and {props.framework}!
        </h1>
    );
};
export default Hello;
