import parsePath from 'parse-filepath';

const API_ROOT = '/api/v1';

function apiPath(p) {
  return `${API_ROOT}/${p}`;
}

// TODO: once API is stateless move this to be a method
export function siblingScriptResourceForName(name, siblingResource, category = 'scripts') {
  let resourceBase = apiPath(`${category}/`);
  if (siblingResource) {
    // FIXME: this assumes siblingResource is absolute and lacks an authority
    resourceBase = `${parsePath(siblingResource).dirname}/`;
  }
  return resourceBase + encodeURI(name);
}

// TODO: switch all this to just use fetch and remove 'rest'
// TODO: switch from snake to camel case
class API {
  listRoot(resourceRoot, cb) {
    fetch(apiPath(resourceRoot)).then(cb);
  }

  // https://stackoverflow.com/questions/40284338/react-fetch-delete-and-put-requests
  writeTextResource(resource, code, cb) {
    const formData = new FormData();
    const codeBlob = new Blob([code], { type: 'text/utf-8' });
    formData.append('value', codeBlob);
    fetch(resource, {
      method: 'PUT',
      body: formData,
    }).then(cb);
  }

  deleteResource(resource, cb) {
    fetch(resource, {
      method: 'DELETE',
    }).then(cb);
  }

  renameResource(resource, name, cb) {
    const formData = new FormData();
    formData.append('name', name);
    fetch(resource, {
      method: 'PATCH',
      body: formData,
    }).then(cb);
  }

  createFolder() {
    console.log('api.createFolder() not implemented');
  }

  getReplEndpoints(cb) {
    const origin = document.location.hostname;
    fetch('repl-endpoints.json').then((response) => {
      response.json().then((data) => {
        // this is ugly; if hostname is missing from the ws urls for the repls insert the hostname
        // of this document
        const config = new Map();
        const template = new Map(Object.entries(data));
        template.forEach((value, key) => {
          const url = new URL(value);
          if (url.hostname === undefined || url.hostname === 'maiden_app_location') {
            url.hostname = origin;
          }
          config.set(key, url.href);
        });
        cb(config);
      });
    });
  }

  resourceForScript(name, _path) {
    // TODO: would be good to clean up and normalize urls
    // TODO: implement path (subdir) support
    return apiPath(name);
  }

  fileFromResource(resource) {
    // MAINT: this totally breaks the encapsulation of script resources and returns what matron
    // would see as the script path
    const prefix = apiPath('scripts/');
    return resource.split(prefix)[1];
  }

  categoryFromResource(resource) {
    // MAINT: another case of broken encapsulation, explorer sections/category tool actions need to
    // ensure the only operate on stuff in their section but the global selection (activeBuffer) is
    // just a URL. here we do evil stuff like extract information out of the URL
    const tail = resource.split(API_ROOT)[1];
    return tail.split('/')[1];
  }
}

export default API;

