import React from 'react';
import ReactDOM from 'react-dom';
import MainFlow from '../components/mainMap/MainFlow';
if ((module as any).hot) {
    (module as any).hot.accept();
}
ReactDOM.render(<MainFlow />, document.getElementById('controlBox'));
