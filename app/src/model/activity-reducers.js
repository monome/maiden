import { ACTIVITY_SELECT } from './activity-actions';

const initialActivityState = {
  selected: 'editor',
};

const activity = (state = initialActivityState, action) => {
  switch (action.type) {
    case ACTIVITY_SELECT:
      return { ...state, selected: action.activity };
    default:
      // default: unrecognized action
      return state;
  }
};

export default activity;
