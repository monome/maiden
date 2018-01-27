import rest from 'rest';
import mime from 'rest/interceptor/mime';

const API_ROOT = '/api/v1'

function api_path(p) {
    return API_ROOT + p;
}

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

    write_script(code, url, cb) {
        const request = {
            method: 'PUT',
            path: url,
            entity: code, // MAINT: does this need encoding?
            headers: {
                'Content-Type': 'text/plain',
            }
        };
        this.client(request).then(cb);
    }

}

export default API;

