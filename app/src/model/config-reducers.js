import {
  UPDATE_EDITOR_CONFIG_SUCCESS,
  EDITOR_CONFIG_SUCCESS,
  EDITOR_CONFIG_FAILURE,
} from './config-actions';

const initialConfigState = {
  editor: undefined,
};

const config = (state = initialConfigState, action) => {
  switch (action.type) {
    case UPDATE_EDITOR_CONFIG_SUCCESS:
      return {
        ...state,
        editor: action.value,
      };

    case EDITOR_CONFIG_SUCCESS:
      return {
        ...state,
        editor: action.value,
      };

    case EDITOR_CONFIG_FAILURE:
      return {
        ...state,
        editor: { tabSize: 2, useSoftTabs: true },
      };

    default:
      return state;
  }
};

export default config;
