import { API_ROOT } from './api'

export const DUST_ROOT = '/dust';
export const EDIT_PREFIX = 'edit'

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

export const inSameDir = (file1, file2) => {
  if (!file1 || !file2) {
    return false;
  }

  const getDir = file => file.split('/').slice(0, -1).join('/');
  const [dir1, dir2] = [file1, file2].map(getDir);
  return dir1 === dir2;
}
