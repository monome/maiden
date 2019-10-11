function OS() {}

OS.isMac = navigator.appVersion.indexOf('Mac') !== -1;

OS.metaKey = function metaKey() {
  return OS.isMac ? '⌘' : 'ctrl+';
};

export default OS;

const dustBase = '/dust/';
const apiBase = '/api/v1';
const baseUrl = '/maiden';

export const findSubPath = (dustPath) => {
  const i = dustPath.indexOf(dustBase);
  return ~i ? dustPath.substring(i + dustBase.length) : null;
}

export const resourceToPath = (resource) => {
  const sub = findSubPath(resource);
  return sub ? `${baseUrl}${dustBase}${sub}` : null;
}

export const pathToResource = (path) => {
  const sub = findSubPath(path);
  return sub ? `${apiBase}${dustBase}${sub}` : null;
}
