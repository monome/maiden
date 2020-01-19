import React, { Component } from 'react';

import Switcher from './components/switcher';
import CatalogList from './components/catalog-list';
import ProjectList from './components/project-list';

import ModalContent from './modal-content';
//import IconButton from './icon-button';
//import { ICONS } from './svg-icons';

import './project-activity.css';
import ModalProgress from './modal-progress';

class ProjectActivity extends Component {
  componentDidMount() {
    this.props.getCatalogSummary(summary => {
      summary.get('catalogs').forEach(detail => {
       const url = detail.get('url');
       this.props.getCatalogByURL(url);
      });
    });
    this.props.getProjectSummary();
  };

  handleTabSelection = name => {
    this.props.projectViewSelect(name);
  };

  handleRefreshAction = url => {
    console.log('refreshing catalog', url);

    const refreshModal = (
      <ModalProgress
        message={`Refreshing catalog...`}
        buttonAction={this.modalDismiss}
      />
    );

    this.props.showModal(refreshModal);

    this.props.updateCatalog(url,
      _ => {
        this.props.hideModal();
      },
      failure => {
        console.log('refresh-catalog failed', failure);
        this.props.showModal(this.errorModalContent(
          `Refreshing catalog failed`,
          failure.error));
      });
  };

  handleInstallAction = (url, name) => {
    console.log('doing install', url, name);

    const installModal = (
      <ModalProgress
        message={`Installing ${name}...`}
        buttonAction={this.modalDismiss}
      />
    );

    this.props.showModal(installModal);

    this.props.installProject(url, name,
      _ => {
        // refresh project list
        this.props.getProjectSummary();
        this.props.refreshCodeDir();
        this.props.hideModal();
      },
      failure => {
        console.log('install-project failed', failure);
        this.props.showModal(this.errorModalContent(
          `Installing project "${name}" failed`,
          failure.error));
      });
  };

  modalDismiss = _ => {
    this.props.hideModal();
  };

  errorModalContent = (message, failure) => {
    const content = (
      <ModalContent
        message={message}
        supporting={failure}
        buttonAction={this.modalDismiss}
        confirmOnly={true}
      />
    );
    return(content);
  };

  handleUpdateAllAction = (projectList) => {
    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateAllProjects(projectList,
          successArr => {
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.showModal(<ModalContent
              message='Updating all projects succeeded.'
              supporting={`${successArr.length ? `The following projects were updated:\n\n${successArr.map(e => e.name).join('\n')}.` : ''}`}
              style={{whiteSpace: 'pre-line'}}
              buttonAction={this.modalDismiss}
              confirmOnly={true}
            />)
          },
          (successArr, failureArr) => {
            this.props.showModal(<ModalContent
              message='Updating all projects failed.'
              supporting={`${successArr.length ? `The following projects were updated:\n\n${successArr.map(e => e.name).join('\n')}.\n\n` : ''}
              The following errors happened:\n\n${failureArr.map(e => `${e.name}: ${e.failureResult.error}`).join('\n')}`}
              style={{whiteSpace: 'pre-line'}}
              buttonAction={this.modalDismiss}
              confirmOnly={true}
            />)
          });
        this.props.showModal(
          <ModalContent
            message='Updating all projects'
            supporting="Updating all projects in progress"
            buttonAction={this.modalDismiss}
            confirmOnly={true}
          />
        );
      } else {
        // update request canceled
        this.props.hideModal();
      }
    };

    const modalContent = (
      <ModalContent
        message={`Update all projects?`}
        supporting="Local modifications will be overwritten"
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(modalContent);
  };


  handleUpdateAction = (url, name) => {
    console.log('doing update', url);

    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateProject(url, name,
          _ => {
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.hideModal();
          },
          failure => {
            console.log('update-project failed', failure);
            this.props.showModal(this.errorModalContent(
              `Updating project "${name}" failed`,
              failure.error));
          });
      } else {
        // update request canceled
        this.props.hideModal();
      }
    };

    const modalContent = (
      <ModalContent
        message={`Update project "${name}"?`}
        supporting="Local modifications will be overwritten"
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(modalContent);
  };

  handleRemoveAction = (url, name) => {
    console.log('doing remove', url);

    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.removeProject(url, name,
          _ => {
            // refresh project list
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.hideModal();
          },
          failure => {
            console.log('remove-project failed', failure);
            this.props.showModal(this.errorModalContent(
              `Removing project "${name}" failed`,
              failure.error));
          });
      } else {
        // canel or any other outcome
        this.props.hideModal();
      }
    };

    const modalContent = (
      <ModalContent
        message={`Delete "${name}"?`}
        supporting="This operation cannot be undone."
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(modalContent);
  };

  render() {
    const switcherSize = {
      height: this.props.height - 10,  // FIXME: not sure why this is longer than it should be
      width: this.props.width,
    };

    return (
      <div className='project-activity-container'>
        <Switcher
          size={switcherSize}
          select={this.handleTabSelection}
          activeTab={this.props.activeComponent}
        >
          <ProjectList
            name='installed'
            projects={this.props.projectSummary}
            updateAllAction={this.handleUpdateAllAction}
            updateAction={this.handleUpdateAction}
            removeAction={this.handleRemoveAction}
          />
          <CatalogList
            name='available'
            catalogSummary={this.props.catalogSummary}
            installedProjects={this.props.projectSummary.get('projects') && this.props.projectSummary.get('projects').map(e => e.get('project_name'))}
            catalogs={this.props.catalogs}
            installAction={this.handleInstallAction}
            refreshAction={this.handleRefreshAction}
          />
         </Switcher>
      </div>
    );
  };

}

export default ProjectActivity;
