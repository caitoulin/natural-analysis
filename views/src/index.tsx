import React from 'react';
import ReactDOM from 'react-dom';
import MainFlow from '../components/mainMap/MainFlow';
import { Provider } from 'react-redux';
import mainStore from './middleware/store';
const store = mainStore();
ReactDOM.render(
    <Provider store={store}>
        <MainFlow />
    </Provider>,
    document.getElementById('controlBox')
);
if ((module as any).hot) {
    (module as any).hot.accept(
        '../components/mainMap/MainFlow', () => {
            const NextApp = require('../components/mainMap/MainFlow').default;
            ReactDOM.render(
                <Provider store={store}>
                    <NextApp />
                </Provider>,
                document.getElementById('controlBox')
            )
        }
    );
}
