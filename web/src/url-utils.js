import api from './api'

const DUST_ROOT = 'dust/';
const EDIT_PREFIX = 'edit/'

export const resourceToEditPath = (resource) => {
  const sub = api.fileFromResource(resource);
  return sub ? `#${EDIT_PREFIX}${DUST_ROOT}${sub}` : null;
}

export const pathToResource = (path) => {
  const i = path.indexOf(DUST_ROOT);
  const sub = i !== -1 ? path.substring(i + DUST_ROOT.length) : null;
  return sub ? api.resourceForScript(sub, 'dust') : null;
}

export const isEditPath = (path) => {
  return path && path.startsWith(EDIT_PREFIX)
}

export const inSameDir = (file1, file2) => {
  if (!file1 || !file2) {
    return false;
  }

  const getDir = file => file.replace(/\/\//g, '/')
                              .split('/').slice(0, -1).join('/');
  const [dir1, dir2] = [file1, file2].map(getDir);
  return dir1 === dir2;
}
