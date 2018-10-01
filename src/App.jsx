import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as routes from './utils/routes';
import Nav from './components/Nav.js';
import Landing from './views/Landing.jsx';
import Profile from './views/Profile.jsx';
import EditProfile from './views/EditProfile.jsx';
import Privacy from './views/Privacy.jsx';
import { openBox, getPublicName, getPublicGithub, getPublicImage, getPrivateEmail, getActivity } from './state/actions';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNav: false,
    };
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    const { location } = this.props;
    const { pathname } = location;
    if (pathname === '/Profile' || pathname === '/EditProfile') {
      this.loadData();
    }
    if (pathname !== '/') {
      this.setState({ showNav: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location } = this.props;
    const { pathname } = location;
    if (nextProps.location.pathname !== pathname && nextProps.location.pathname !== '/') {
      this.setState({ showNav: true });
    }
  }

  async loadData() {
    await this.props.getActivity();
    await this.props.openBox();
    await this.props.getPublicName();
    await this.props.getPublicGithub();
    await this.props.getPublicImage();
    await this.props.getPrivateEmail();
  }

  render() {
    const { showNav } = this.state;
    // const { location } = this.props;
    // const { pathname } = location;
    
    return (
      <Router basename={routes.LANDING}>
        <div className="App">
          {showNav
            && <Nav />
          }
          <Switch>
            <Route exact path={routes.LANDING} component={Landing} />
            <Route exact path={routes.PROFILE} component={Profile} />
            <Route exact path={routes.EDITPROFILE} component={EditProfile} />
            <Route exact path={routes.PRIVACY} component={Privacy} />
          </Switch>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  openBox: PropTypes.func,
  getPublicName: PropTypes.func,
  getPublicGithub: PropTypes.func,
  getPublicImage: PropTypes.func,
  getPrivateEmail: PropTypes.func,
  getActivity: PropTypes.func,
  location: PropTypes.object,
};

App.defaultProps = {
  openBox: openBox(),
  getPublicName: getPublicName(),
  getPublicGithub: getPublicGithub(),
  getPublicImage: getPublicImage(),
  getPrivateEmail: getPrivateEmail(),
  getActivity: getActivity(),
  location: {},
};

const mapState = state => ({
  threeBox: state.threeBox,
});

export default withRouter(connect(mapState,
  {
    openBox, getPublicName, getPublicGithub, getPublicImage, getPrivateEmail, getActivity,
  })(App));