import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import { history, LOCATION_CHANGE } from './router';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));

history.listen((location, action) => {
  store.dispatch({
    type: LOCATION_CHANGE,
    payload: { location, action },
  });
});

export { history };
export default store;
