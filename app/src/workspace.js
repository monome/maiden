import React, { Component } from 'react';
import ReactModal from 'react-modal';
import ActivityBar from './activity-bar';
import activities from './activities';
import { commandService, keyService } from './services';
import './workspace.css';

ReactModal.setAppElement('#root')

class Workspace extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activityBarWidth: 50,
            showModal: false,
        };
    }

    componentWillMount() {
        // MAINT: this is a bit odd here but we initiate the connections for the repl early so that any actions taken in the editor (or output from matron/crone) is captured even if the repl isn't being displayed
       this.props.replEndpoints(this.props.api, (endpoints) => {
           endpoints.forEach((endpoint, component) => {
               this.props.replConnect(component, endpoint)
           })
       })

       // trigger initial read of top level scripts
       this.props.scriptList(this.props.api)
       this.props.dataList(this.props.api)
       this.props.audioList(this.props.api)

       // register workspace commands
       this.registerCommands()

       // prevent accidental navigation out of maiden via swipe gestures
       var preventNavigation = function (e) {
         var delta = e.deltaX || e.wheelDeltaX;
         if (!delta) {
             return;
         }

         // adjust for safari
         if (window.WebKitMediaKeyError) {
             delta *= -1;
         }

         const elem = document.body;
         if (((elem.scrollLeft + elem.offsetWidth) === elem.scrollWidth && delta > 0) || (elem.scrollLeft === 0 && delta < 0)) {
             e.preventDefault();
         }
       };
       document.addEventListener('mousewheel', preventNavigation);

       // direct key events to the key service for handling
       document.onkeydown= (event) => keyService.handleKey(event)
    }

    registerCommands() {
       commandService.registerCommand('show config', () => {
        // TODO (pq): consider pushing find into a service.
        const activity = activities.find(a => a.selector === 'configure');
        this.handleActivitySelection(activity);
     });
    }

    activityBarSize() {
        return {
            width: this.state.activityBarWidth,
            height: this.props.height,
        };
    }

    activityViewSize() {
        return {
            width: this.props.width - this.state.activityBarWidth,
            height: this.props.height,
        };
    }

    handleActivitySelection = (activity) => {
        if (activity.selector === this.props.selected) {
            this.props.toggleComponent(activity.toggle)
        }
        else {
            this.props.activitySelect(activity.selector)
        }
    }

    handleShowModal = (content) => {
        this.setState({
            showModal: true,
            modalContent: content,
        })
    }

    handleHideModal = () => {
        this.setState({
            showModal: false,
            modalContent: undefined,
        })
    }

    render() {
        const selectedActivity = this.props.activities.find(a => {
            return this.props.selected === a.selector
        });
        const ActivityView = selectedActivity.view;

        return (
            <div className="workspace">
                <ActivityBar
                    style={this.activityBarSize()}
                    selected={this.props.selected}
                    activities={this.props.activities}
                    buttonAction={this.handleActivitySelection} />
                <ActivityView
                    {...this.activityViewSize()}
                    showModal={this.handleShowModal}
                    hideModal={this.handleHideModal}
                    api={this.props.api}
                />
                <ReactModal
                    isOpen={this.state.showModal}
                    contentLabel={"something"}
                    className="workspace-modal"
                    overlayClassName="workspace-modal-overlay"
                >
                    {this.state.modalContent}
                </ReactModal>
            </div>
        )
    }
}

export default Workspace;