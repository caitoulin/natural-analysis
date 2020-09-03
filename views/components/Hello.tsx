import React from 'react';
export interface HelloProps {
    compiler: string;
    framework: string;
}
<<<<<<< HEAD
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
=======
const Hello = (props: HelloProps) => (
    <h1>
        Hello from {props.compiler} and {props.framework}!
    </h1>
);
>>>>>>> 266a437b93b7c4cd6b4a7bff8d5dffcec7821c81

export default Hello;
