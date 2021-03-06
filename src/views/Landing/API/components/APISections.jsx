/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/prop-types */
import React from 'react';
import { Element } from 'react-scroll';

import DownArrow from '../../../../assets/DownArrow.svg';
import ProfilesSmall from '../../../../assets/Profiles.svg';
import MessagingSmall from '../../../../assets/Messaging.svg';
import StorageSmall from '../../../../assets/Storage.svg';

export const ProfileSection = ({ handleOpenSection, openSection }) => (
  <Element name="profiles">
    <section className="api_sections" onClick={() => handleOpenSection('profiles')} onKeyPress={() => handleOpenSection('profiles')}>
      <div className="api_sections_wrapper">
        <div className="api_sections_content">
          <img src={ProfilesSmall} alt="" />
          <h3>Profiles</h3>
          <p>Read and update user profiles</p>
        </div>
        <button className="clearButton" type="button">
          <img src={DownArrow} alt="" className={`openSectionButton ${openSection ? 'flipOpenSectionButton' : ''}`} />
        </button>
      </div>
    </section>
  </Element>
);

export const MessagingSection = ({ handleOpenSection, openSection }) => (
  <Element name="messaging">
    <section className="api_sections" onClick={() => handleOpenSection('messaging')} onKeyPress={() => handleOpenSection('messaging')}>
      <div className="api_sections_wrapper">
        <div className="api_sections_content">
          <img src={MessagingSmall} alt="" />
          <h3>Messaging</h3>
          <p>Add chat, comment, and content threads</p>
        </div>
        <button className="clearButton" type="button">
          <img src={DownArrow} alt="" className={`openSectionButton ${openSection ? 'flipOpenSectionButton' : ''}`} />
        </button>
      </div>
    </section>
  </Element>
);

export const StorageSection = ({ handleOpenSection, openSection }) => (
  <Element name="storage">
    <section className="api_sections" onClick={() => handleOpenSection('storage')} onKeyPress={() => handleOpenSection('storage')}>
      <div className="api_sections_wrapper">
        <div className="api_sections_content">
          <img src={StorageSmall} alt="" />
          <h3>Storage</h3>
          <p>Read and update app specific datastores</p>
        </div>
        <button className="clearButton" type="button">
          <img src={DownArrow} alt="" className={`openSectionButton ${openSection ? 'flipOpenSectionButton' : ''}`} />
        </button>
      </div>
    </section>
  </Element>
);
