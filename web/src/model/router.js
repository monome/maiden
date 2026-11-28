import { createBrowserHistory } from 'history';

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

export const history = createBrowserHistory();

export const push = (path) => () => {
  history.push(path);
};

export const initialRouterState = {
  location: history.location,
  action: history.action,
};

export default function router(state = initialRouterState, action) {
  if (action.type === LOCATION_CHANGE) {
    return action.payload;
  }
  return state;
}
