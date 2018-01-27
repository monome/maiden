import React from 'react';
import Activity from './activity'
import EditView from './edit-view'

class EditActivity extends Activity {
    constructor(api) {
        super("edit");
        this.buffers = {};
        this.api = api;
    }

    getView(props) {
        return <EditView {...props} api={this.api} />;
    }

    loadScript(name) {

    }

    switchToBuffer(name) {

    }

}

export default EditActivity