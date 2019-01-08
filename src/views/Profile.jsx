import React from 'react';
import { withRouter } from 'react-router-dom';

import Content from '../components/Profile/Content';
import Categories from '../components/Profile/Categories';
import Nav from '../components/Nav';
import './styles/Profile.css';

const Profile = () => (
  <div>
    <Nav />
    <div id="profile__page">
      <div id="profile__contents">
        <Categories />
        <Content />
      </div>
    </div>
  </div>
);

export default withRouter(Profile);
