function OS() {
}

OS.isMac = navigator.appVersion.indexOf('Mac') !== -1;

OS.metaKey = function metaKey() {
  return OS.isMac ? '⌘' : 'ctrl';
};

export default OS;
