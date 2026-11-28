import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './app';
import store from './model/store';

// https://stackoverflow.com/questions/39962757/prevent-scrolling-using-css-on-react-rendered-components
document.body.style.overflow = 'hidden';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
