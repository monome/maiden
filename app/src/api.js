import rest from 'rest';
import mime from 'rest/interceptor/mime';

const API_ROOT = '/api/v1'

function api_path(p) {
    return API_ROOT + p;
}

// TODO: switch all this to just use fetch and remove 'rest'
class API {
    constructor() {
        this.client = rest.wrap(mime);
    }

    list_scripts(cb) {
        const request = {
            method: 'GET',
            path: api_path('/scripts'),
        };
        this.client(request).then(cb);
    }

    read_script(url, cb) {
        this.client(url).then(cb);
    }
    
    // https://stackoverflow.com/questions/40284338/react-fetch-delete-and-put-requests
    write_script(resource, code, cb) {
        const formData = new FormData();
        formData.append('value', code)
        fetch(resource, {
            method: 'PUT',
            body: formData,
        }).then(cb)
    }
    
    list_repl_endpoints(cb) {
        fetch('/repl-endpoints.json').then((response) => {
            // TODO: parse url and insert hostname if not specified
            response.json().then(cb)
        })
    }
}

export default API;

