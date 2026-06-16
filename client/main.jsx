import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';

// Client startup file. When Meteor is ready on the client, mount
// the top-level React `App` component into the DOM element with id `root`.
Meteor.startup(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
