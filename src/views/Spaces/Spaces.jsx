import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { store } from '../../state/store';
import {
  SpaceOpenedModal,
  ViewSpaceDataItemModal,
  DeleteSpaceItemModal,
  OpenSpaceModal,
  ListSpaceItemModal,
} from './components/SpacesModals';
import { ModalBackground } from '../../components/Modals';
import AllView from './components/AllView';
import SpaceView from './components/SpaceView';
import Header from './components/Header';
import SpacesList from './components/SpacesList';
import Nav from '../../components/Nav';
import './styles/Spaces.css';
import { sortSpace, extractRow, checkRowType } from '../../utils/funcs';
import actions from '../../state/actions';

const { viewSpaceItem } = actions.spaces;

class Spaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spaceToDisplay: 'All Data',
      spaceNameOpened: '',
      vaultToOpen: '',
      sortBy: '',
      sortDirection: true,
      showSpaceList: true,
      isLoadingVault: false,
      showSpacesMobile: false,
    };
    this.openSpace = this.openSpace.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    const { allData } = this.props;

    this.sortData('name', allData, 'All Data', false);
  }

  componentWillReceiveProps(nextProps) {
    const { hasUpdated } = this.props;
    const { allData } = nextProps;
    if (allData !== this.props.allData && !hasUpdated) {
      this.sortData('name', allData, 'All Data', true);
      store.dispatch({
        type: 'SPACES_HAS_UPDATED',
        hasUpdated: true,
      });
    }
  }

  handleSpaceListView = () => {
    const { showSpaceList } = this.state;
    this.setState({ showSpaceList: !showSpaceList });
  }

  sortData = (category, updatedData, spaceName, newSort) => {
    const { allData, sortedSpace, spaceDataToRender } = this.props;
    const { sortBy, sortDirection } = this.state;
    let updatedSortedSpace = [];

    if (newSort || sortBy !== category) {
      if (spaceName === 'All Data') {
        Object.entries(updatedData || allData).forEach((space) => {
          extractRow(space[1], space[0], updatedSortedSpace);
        });
      } else {
        extractRow(updatedData[spaceName] || allData[spaceName], spaceName, updatedSortedSpace);
      }

      if (updatedSortedSpace.length > 0) sortSpace(updatedSortedSpace, category);
      this.setState({ sortBy: category, spaceToDisplay: spaceName });
      if (!sortDirection) updatedSortedSpace.reverse();
    } else {
      // reverse order of list
      updatedSortedSpace = spaceName === 'All Data' ? sortedSpace.slice() : spaceDataToRender.slice();
      updatedSortedSpace.reverse();
      this.setState({ sortDirection: !sortDirection });
    }

    let dispatchObject = {};

    if (spaceName === 'All Data') {
      dispatchObject = {
        type: 'SPACES_DATA_TO_RENDER_UPDATE',
        sortedSpace: updatedSortedSpace,
      };
    } else {
      dispatchObject = {
        type: 'SPACES_DATA_TO_RENDER_UPDATE',
        spaceDataToRender: updatedSortedSpace,
        sortedSpace: sortedSpace.slice(),
      };
    }
    store.dispatch(dispatchObject);
  }

  updateAndSort = (sortBy, updatedAllData, spaceToDisplay, list) => {
    store.dispatch({
      type: 'SPACES_DATA_UPDATE',
      list,
      allData: updatedAllData,
    });

    this.sortData(sortBy, updatedAllData, spaceToDisplay, true);
  }

  async deleteItem(spaceName, key, privacy, listIndex) {
    const {
      box,
      allData,
      list,
      collectiblesFavorites,
      collectiblesFavoritesToRender,
      collection,
    } = this.props;
    const { sortBy, spaceToDisplay } = this.state;
    const updatedAllData = cloneDeep(allData);
    const updatedCollection = collection && collection.slice();
    const updatedCollectiblesFavorites = collectiblesFavorites && collectiblesFavorites.slice();
    const updatedCollectiblesFavoritesToRender = collectiblesFavoritesToRender && collectiblesFavoritesToRender.slice();

    if (spaceName === '3Box') {
      let proof;
      let keyUppercase;

      if (key === 'verifiedGithub') {
        proof = 'proof_github';
        keyUppercase = 'VERIFIED_GITHUB';
      } else if (key === 'verifiedTwitter') {
        proof = 'proof_twitter';
        keyUppercase = 'VERIFIED_TWITTER';
      } else if (key === 'verifiedEmail') {
        proof = 'proof_email';
        keyUppercase = 'VERIFIED_EMAIL';
      } else {
        keyUppercase = key.toUpperCase();
      }

      if (key === 'collectiblesFavoritesToRender' && updatedCollectiblesFavorites.length === 1) {
        box[privacy].remove('collectiblesFavorites');
        store.dispatch({
          type: 'MY_COLLECTIBLESFAVORITES_UPDATE',
          collectiblesFavorites: [],
          collectiblesFavoritesToRender: [],
        });
        delete updatedAllData[spaceName][privacy][key];
        this.updateAndSort(sortBy, updatedAllData, spaceToDisplay, list);
      } else if (key === 'collectiblesFavoritesToRender' && typeof listIndex === 'number') {
        updatedCollectiblesFavorites.splice(listIndex, 1);
        const replaced = updatedCollectiblesFavoritesToRender.splice(listIndex, 1);
        updatedCollection.push(replaced);
        updatedAllData['3Box'].public.collectiblesFavoritesToRender.splice(listIndex, 1);
        box.public.set('collectiblesFavorites', updatedCollectiblesFavorites);
        store.dispatch({
          type: 'MY_COLLECTIBLESFAVORITES_UPDATE',
          collectiblesFavorites: updatedCollectiblesFavorites,
          collectiblesFavoritesToRender: updatedCollectiblesFavoritesToRender,
        });
        this.updateAndSort(sortBy, updatedAllData, spaceToDisplay, list);
      } else {
        box[privacy].remove(proof || key);
        store.dispatch({
          type: `MY_${keyUppercase}_UPDATE`,
          [key]: null,
        });
        delete updatedAllData[spaceName][privacy][key];
        this.updateAndSort(sortBy, updatedAllData, spaceToDisplay, list);
      }
    } else if (typeof listIndex === 'number') {
      if (updatedAllData[spaceName][privacy][key].length === 1) {
        box.spaces[spaceName][privacy].remove(key);
        delete updatedAllData[spaceName][privacy][key];
      } else {
        updatedAllData[spaceName][privacy][key].splice(listIndex, 1);
        box.spaces[spaceName][privacy].set(key, updatedAllData[spaceName][privacy][key]);
      }
      this.updateAndSort(sortBy, updatedAllData, spaceToDisplay, list);
    } else {
      box.spaces[spaceName][privacy].remove(key);
      delete updatedAllData[spaceName][privacy][key];
      this.updateAndSort(sortBy, updatedAllData, spaceToDisplay, list);
    }
  }

  async openSpace(spaceName, key, privacy) {
    const {
      box,
      allData,
      list,
      spacesOpened,
      showDeleteItemModal,
    } = this.props;
    const {
      sortBy,
      spaceToDisplay,
    } = this.state;

    this.setState({ isLoadingVault: true, vaultToOpen: spaceName });

    const updatedAllData = cloneDeep(allData);
    const updatedspacesOpened = cloneDeep(spacesOpened);

    const updateSpaceData = async () => {
      const publicSpace = await box.spaces[spaceName].public.all();
      const privateSpace = await box.spaces[spaceName].private.all();

      console.log('publicSpace', publicSpace);
      console.log('privateSpace', privateSpace);

      updatedAllData[spaceName].public = publicSpace;
      updatedAllData[spaceName].private = privateSpace;
      updatedspacesOpened[spaceName] = true;

      this.setState({ spaceNameOpened: spaceName });
      this.sortData(sortBy, updatedAllData, spaceToDisplay, true);

      store.dispatch({
        type: 'SPACES_DATA_UPDATE',
        list,
        allData: updatedAllData,
      });
      store.dispatch({
        type: 'UI_SPACE_OPENED',
        spacesOpened: updatedspacesOpened,
        showSpaceOpenedModal: true,
      });

      if (showDeleteItemModal) {
        this.deleteItem(
          spaceName,
          key,
          privacy,
        );
        this.props.viewSpaceItem(false, false, false);
      }

      setTimeout(() => {
        store.dispatch({
          type: 'UI_HANDLE_SPACE_OPENED_MODAL',
          showSpaceOpenedModal: false,
        });
      }, 3000);
    };

    const opts = {
      onSyncDone: () => {
        updateSpaceData();
      },
    };

    await box.openSpace(spaceName, opts);

    this.setState({ isLoadingVault: false, vaultToOpen: '' });
  }

  render() {
    const {
      list,
      isSpacesLoading,
      spacesOpened,
      showSpaceOpenedModal,
      showSpaceDataItemModal,
      spaceItem,
      showDeleteItemModal,
      showOpenSpaceModal,
    } = this.props;

    const {
      spaceToDisplay,
      spaceNameOpened,
      sortBy,
      sortDirection,
      isLoadingVault,
      vaultToOpen,
      showSpaceList,
      showSpacesMobile,
    } = this.state;

    console.log('showSpacesMobile', showSpacesMobile);

    return (
      <div>
        <Nav />
        <div className="data__page">
          <ReactCSSTransitionGroup
            transitionName="app__modals"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}
          >
            {showSpaceOpenedModal && <SpaceOpenedModal spaceName={spaceNameOpened} />}

            {showSpaceDataItemModal && (
              (Array.isArray(spaceItem.dataValue) && spaceItem.dataValue.length > 0 && spaceItem.rowType !== 'Image')
                ? (
                  <div className="modal__container modal--effect list__container">
                    <div className="list__scrollable-wrapper">
                      {spaceItem.dataValue.map((item, i) => {
                        return (
                          <ListSpaceItemModal
                            viewSpaceItem={this.props.viewSpaceItem}
                            spaceName={spaceItem.spaceName}
                            dataKey={spaceItem.dataKey}
                            rowType={checkRowType(item)}
                            dataValue={spaceItem.dataValue}
                            privacy={spaceItem.privacy}
                            lastUpdated={spaceItem.lastUpdated}
                            index={i}
                            length={spaceItem.dataValue.length}
                            item={item}
                          />);
                      })}
                    </div>
                  </div>
                ) : (
                  <ViewSpaceDataItemModal
                    viewSpaceItem={this.props.viewSpaceItem}
                    spaceName={spaceItem.spaceName}
                    dataKey={spaceItem.dataKey}
                    rowType={spaceItem.rowType}
                    dataValue={spaceItem.dataValue}
                    privacy={spaceItem.privacy}
                    lastUpdated={spaceItem.lastUpdated}
                  />))}

            {showDeleteItemModal && (
              <DeleteSpaceItemModal
                spaceItem={spaceItem}
                viewSpaceItem={this.props.viewSpaceItem}
                spacesOpened={spacesOpened}
                openSpace={this.openSpace}
                deleteItem={this.deleteItem}
              />)}

            {showOpenSpaceModal && (
              <OpenSpaceModal
                spaceItem={spaceItem}
                viewSpaceItem={this.props.viewSpaceItem}
              />)}

            {(showSpaceDataItemModal || showDeleteItemModal || showOpenSpaceModal) && <ModalBackground viewSpaceItem={this.props.viewSpaceItem} />}
          </ReactCSSTransitionGroup>

          <SpacesList
            spaceToDisplay={spaceToDisplay}
            sortData={this.sortData}
            handleSpaceListView={this.handleSpaceListView}
            sortBy={sortBy}
            list={list}
            show={showSpaceList}
          // showSpacesMobile={showSpacesMobile}
          />

          <main className={`dataExplorer ${showSpaceList ? '' : 'wideDataExplorer'} `}>
            <Header
              spaceToDisplay={spaceToDisplay}
              isSpacesLoading={isSpacesLoading}
              sortBy={sortBy}
              handleSpaceListView={this.handleSpaceListView}
              sortDirection={sortDirection}
              sortData={this.sortData}
              show={showSpaceList}
            // showSpacesMobile={showSpacesMobile}
            />

            <section className="data__items">
              {spaceToDisplay === 'All Data'
                ? (
                  <AllView
                    spacesOpened={spacesOpened}
                    isLoadingVault={isLoadingVault}
                    vaultToOpen={vaultToOpen}
                    openSpace={this.openSpace}
                  />
                )
                : (
                  <SpaceView
                    openSpace={this.openSpace}
                    isLoadingVault={isLoadingVault}
                    vaultToOpen={vaultToOpen}
                    spacesOpened={spacesOpened}
                    spaceName={spaceToDisplay}
                  />
                )
              }
            </section>
          </main>
        </div>
      </div>
    );
  }
}

Spaces.propTypes = {
  list: PropTypes.array,
  viewSpaceItem: PropTypes.func.isRequired,
  spaceDataToRender: PropTypes.array,
  sortedSpace: PropTypes.array,
  allData: PropTypes.object,
  spaceItem: PropTypes.object,
  box: PropTypes.object,
  spacesOpened: PropTypes.object,
  isSpacesLoading: PropTypes.bool,
  showSpaceOpenedModal: PropTypes.bool,
  showSpaceDataItemModal: PropTypes.bool,
  showDeleteItemModal: PropTypes.bool,
  hasUpdated: PropTypes.bool,
  showOpenSpaceModal: PropTypes.bool,
};

Spaces.defaultProps = {
  list: [],
  sortedSpace: [],
  spaceDataToRender: [],
  allData: {},
  spaceItem: {},
  box: {},
  spacesOpened: {},
  isSpacesLoading: false,
  showSpaceOpenedModal: false,
  showSpaceDataItemModal: false,
  showOpenSpaceModal: false,
  showDeleteItemModal: false,
  hasUpdated: false,
};

function mapState(state) {
  return {
    list: state.spaces.list,
    allData: state.spaces.allData,
    box: state.myData.box,
    collectiblesFavorites: state.myData.collectiblesFavorites,
    collection: state.myData.collection,
    collectiblesFavoritesToRender: state.myData.collectiblesFavoritesToRender,
    isSpacesLoading: state.uiState.isSpacesLoading,
    spacesOpened: state.uiState.spacesOpened,
    showSpaceOpenedModal: state.uiState.showSpaceOpenedModal,
    currentAddress: state.userState.currentAddress,
    sortedSpace: state.spaces.sortedSpace,
    spaceDataToRender: state.spaces.spaceDataToRender,
    hasUpdated: state.spaces.hasUpdated,
    spaceItem: state.uiState.spaceItem,
    showSpaceDataItemModal: state.uiState.showSpaceDataItemModal,
    showDeleteItemModal: state.uiState.showDeleteItemModal,
    showOpenSpaceModal: state.uiState.showOpenSpaceModal,
  };
}

export default withRouter(connect(mapState, { viewSpaceItem })(Spaces));