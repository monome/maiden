import parsePath from 'parse-filepath';

const API_ROOT = '/api/v1';

function apiPath(p) {
  return `${API_ROOT}/${p}`;
}

class API {
  static siblingResourceForName(name, siblingResource, category = 'scripts') {
    let resourceBase = apiPath(`${category}/`);
    if (siblingResource) {
      // FIXME: this assumes siblingResource is absolute and lacks an authority
      resourceBase = `${parsePath(siblingResource).dirname}/`;
    }
    return resourceBase + encodeURI(name);
  }
  
  static childResourceForName(name, parentResource) {
    return `${parentResource}/${encodeURI(name)}`;
  }
  
  static listRoot(resourceRoot, cb) {
    fetch(apiPath(resourceRoot)).then(cb);
  }

  // https://stackoverflow.com/questions/40284338/react-fetch-delete-and-put-requests
  static writeTextResource(resource, code, cb) {
    const formData = new FormData();
    const codeBlob = new Blob([code], { type: 'text/utf-8' });
    formData.append('value', codeBlob);
    fetch(resource, {
      method: 'PUT',
      body: formData,
    }).then(cb);
  }

  static writeJSONResource(resource, code, cb) {
    const formData = new FormData();
    const codeBlob = new Blob([JSON.stringify(code)], { type: 'application/json' });
    formData.append('value', codeBlob);
    fetch(resource, {
      method: 'PUT',
      body: formData,
    }).then(cb);
  }

  static getResource(resource, cb) {
    fetch(resource, {
      method: 'GET',
    }).then(cb);
  }

  static deleteResource(resource, cb) {
    fetch(resource, {
      method: 'DELETE',
    }).then(cb);
  }

  static renameResource(resource, name, cb) {
    const formData = new FormData();
    formData.append('name', name);
    fetch(resource, {
      method: 'PATCH',
      body: formData,
    }).then(cb);
  }

  static createFolder(resource, cb) {
    const url = new URL(resource, document.origin);
    url.searchParams.append('kind', 'directory');
    fetch(url, {
      method: 'PUT',
    }).then(cb);
  }

  static getReplEndpoints(cb) {
    const origin = document.location.hostname;
    fetch('repl-endpoints.json').then((response) => {
      response.json().then((data) => {
        // this is ugly; if hostname is missing from the ws urls for the repls insert the hostname of this document
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

  static resourceForScript(name, path) {
    // TODO: would be good to clean up and normalize urls
    if (path) {
      return apiPath(`${path}/${name}`);
    }
    return apiPath(name);
  }

  static fileFromResource(resource) {
    // MAINT: this totally breaks the encapsulation of script resources and returns what matron would see as the script path
    const prefix = apiPath('dust/scripts/');
    return resource.split(prefix)[1];
  }

  static categoryFromResource(resource) {
    // MAINT: another case of broken encapsulation, explorer sections/category tool actions need to ensure the only operate on stuff in their section but the global selection (activeBuffer) is just a URL. here we do evil stuff like extract information out of the URL
    const tail = resource.split(API_ROOT)[1];
    return tail.split('/')[1];
  }

  static editorConfigResource() {
    return API.resourceForScript('editor.json', 'dust/data');
  }
}

export default API;
