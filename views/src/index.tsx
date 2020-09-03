import React from 'react';
import ReactDOM from 'react-dom';
import Hello from '../components/Hello';
if ((module as any).hot) {
    (module as any).hot.accept();
}
ReactDOM.render(
    <Hello compiler="TypeScript" framework="React" />,
    document.getElementById('test')
);
