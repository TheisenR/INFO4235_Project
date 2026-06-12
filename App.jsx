import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx';

export const App = () => {
  const currentUser = useTracker(() => Meteor.user());

  if (!currentUser) {
    return <LoginPage />;
  }

  return <HomePage user={currentUser} />;
};