import { API_ROOT } from './api'

export const DUST_ROOT = '/dust';

// NB trailing instead of leading slash
export const EDIT_PREFIX = 'edit/'

export const findSubPath = (dustPath) => {
  const i = dustPath.indexOf(DUST_ROOT);
  return ~i ? dustPath.substring(i + DUST_ROOT.length) : null;
}

export const resourceToEditPath = (resource) => {
  const sub = findSubPath(resource);
  return sub ? `#${EDIT_PREFIX}${DUST_ROOT}${sub}` : null;
}

export const pathToResource = (path) => {
  const sub = findSubPath(path);
  return sub ? `${API_ROOT}${DUST_ROOT}${sub}` : null;
}

export const isEditPath = (path) => {
    return path && path.startsWith(EDIT_PREFIX)
}
