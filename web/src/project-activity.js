import React, { Component } from 'react';

import Switcher from './components/switcher';
import CatalogList from './components/catalog-list';
import ProjectList from './components/project-list';

import ModalContent from './modal-content';
//import IconButton from './icon-button';
//import { ICONS } from './svg-icons';

import { orderResultsByProjectName } from './model/project-actions';

import './project-activity.css';
import ModalProgress from './modal-progress';

const SYSTEM_RESET_RECOMMENDATION = 'Run SYSTEM > RESET to ensure engine changes take effect';

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
        this.props.showModal(this.informModalContent(
          `Refreshing catalog failed`,
          failure.error));
      });
  };

  handleRefreshAllAction = (catalogSummary) => {
    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateAllCatalogs(catalogSummary, (successArr, failureArr) => {
          this.props.showModal(this.updateRefreshAllModalContent(successArr, failureArr));
        });

        this.props.showModal(
          <ModalContent
            message='Refreshing all catalogs'
            supporting="please wait..."
            buttonAction={this.modalDismiss}
            confirmOnly={true}
          />
        );
      } else {
        // update request canceled
        this.props.hideModal();
      }
    };

    this.props.showModal(
      <ModalContent
        message={`Refresh all catalogs?`}
        buttonAction={modalCompletion}
      />
    );
  };

  updateRefreshAllModalContent = (successArr, failureArr) => {
    let success = undefined;
    if (successArr && successArr.length) {
      success = (
        <div>
          <span className='project-activity-update-modal-section-header'>Updated</span>
          <br /><br />
          <table>
            <tbody>
              {successArr.map(e => (<tr><td>{e.name}</td></tr>))}
            </tbody>
          </table><br /><br />
        </div>
      );
    }

    let failure = undefined;
    if (failureArr && failureArr.length) {
      failure = (
        <div>
          <span className='project-activity-update-modal-section-header'>Failed</span>
          <br /><br />
          <table>
            <tbody>
              {failureArr.map(e => (
                <tr>
                  <td style={{ width: '100px' }}>{e.name}</td>
                  <td style={{ width: 'auto' }}>{e.failureResult.error}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <ModalContent
        buttonAction={this.modalDismiss}
        confirmOnly={true}
      >
        {success}
        {failure}
      </ModalContent>
    )
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
        this.props.showModal(
          this.informModalContent(`Installed project: "${name}"`,
            SYSTEM_RESET_RECOMMENDATION,
          )
        );
      },
      failure => {
        console.log('install-project failed', failure);
        this.props.showModal(this.informModalContent(
          `Installing project "${name}" failed`,
          failure.error));
      });
  };

  modalDismiss = _ => {
    this.props.hideModal();
  };

  informModalContent = (message, supporting) => {
    const content = (
      <ModalContent
        message={message}
        supporting={supporting}
        buttonAction={this.modalDismiss}
        confirmOnly={true}
      />
    );
    return(content);
  };

  updateSummaryModalContent = (successArr, failureArr) => {
    let success = undefined;
    if (successArr && successArr.length) {
      success = (
        <div>
          <span className='project-activity-update-modal-section-header'>Updated</span>
          <br /><br />
          <table>
            <tbody>
              {successArr.map(e => (<tr><td>{e.name}</td></tr>))}
            </tbody>
          </table>
          <br />
          <span className='supporting'>{SYSTEM_RESET_RECOMMENDATION}</span>
          <br /><br />
        </div>
      );
    } else {
      success = (
        <div>
          <span className='project-activity-update-modal-section-header'>No updates</span>
          <br /><br />
          <span className='project-activity-update-modal-section-message'>
            The latest versions are already installed
          </span>
          <br /><br />
        </div>
      );
    }

    let failure = undefined;
    if (failureArr && failureArr.length) {
      failure = (
        <div>
          <span className='project-activity-update-modal-section-header'>Failed</span>
          <br /><br />
          <table>
            <tbody>
              {failureArr.map(e => (
                <tr>
                  <td style={{ width: '100px' }}>{e.name}</td>
                  <td style={{ width: 'auto' }}>{e.failureResult.error}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <ModalContent
        buttonAction={this.modalDismiss}
        confirmOnly={true}
      >
        {success}
        {failure}
      </ModalContent>
    )
  };

  handleUpdateAllAction = (projectList) => {
    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateAllProjects(projectList,
          // completion callback
          (successArr, failureArr) => {
            if (successArr) {
              successArr = successArr.sort(orderResultsByProjectName).filter(response => response.successResult.updated);
            }
            if (failureArr) {
              failureArr = failureArr.sort(orderResultsByProjectName);
            }
            this.props.getProjectSummary();
            this.props.refreshCodeDir();
            this.props.showModal(this.updateSummaryModalContent(successArr, failureArr));
          });

        this.props.showModal(
          <ModalContent
            message='Updating all projects'
            supporting="Please wait..."
            buttonAction={this.modalDismiss}
            confirmOnly={true}
          />
        );
      } else {
        // update request canceled
        this.props.hideModal();
      }
    };

    const confirmUpdateAllModalContent = (
      <ModalContent
        message={`Update all projects?`}
        supporting="Local modifications will be overwritten"
        buttonAction={modalCompletion}
      />
    );

    this.props.showModal(confirmUpdateAllModalContent);
  };


  handleUpdateAction = (url, name) => {
    console.log('doing update', url);

    const modalCompletion = choice => {
      if (choice === 'ok') {
        this.props.updateProject(url, name,
          success => {
            console.log('updated', success);
            if (success.updated) {
              this.props.getProjectSummary();
              this.props.refreshCodeDir();
              this.props.showModal(
                this.informModalContent(`Updated project: "${name}"`,
                  SYSTEM_RESET_RECOMMENDATION,
                )
              );
            } else {
              this.props.showModal(
                this.informModalContent('No updates',
                  `The latest version of "${name}" is already installed`,
                )
              );
            }
          },
          failure => {
            console.log('update-project failed', failure);
            this.props.showModal(this.informModalContent(
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
            this.props.showModal(this.informModalContent(
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
            refreshAllAction={this.handleRefreshAllAction}
            installAction={this.handleInstallAction}
            refreshAction={this.handleRefreshAction}
          />
         </Switcher>
      </div>
    );
  };

}

export default ProjectActivity;
