import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';

Meteor.startup(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
