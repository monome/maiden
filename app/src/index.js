import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './app';
import registerServiceWorker from './worker';
import store from './model/store';
import API from './api';

// https://stackoverflow.com/questions/39962757/prevent-scrolling-using-css-on-react-rendered-components
document.body.style.overflow = 'hidden';

const api = new API();

ReactDOM.render(
  <Provider store={store}>
    <App api={api} />
  </Provider>,
  document.getElementById('root'),
);

registerServiceWorker();
