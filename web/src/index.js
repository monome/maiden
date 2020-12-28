import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './app';
import store, { history } from './model/store';
import { ConnectedRouter } from 'connected-react-router';

// https://stackoverflow.com/questions/39962757/prevent-scrolling-using-css-on-react-rendered-components
document.body.style.overflow = 'hidden';

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
);
