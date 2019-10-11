import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'
import createRootReducer from './reducers';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const history = createBrowserHistory();

const store = createStore(
  createRootReducer(history),
  /* preloadedState, */ composeEnhancers(applyMiddleware(thunkMiddleware)),
  compose(
    applyMiddleware(
      routerMiddleware(history),
    )
  )
);

export default store;
