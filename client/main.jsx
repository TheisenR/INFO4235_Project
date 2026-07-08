import React from 'react';
import ReactDOM from 'react-dom/client';
import { Meteor } from 'meteor/meteor';

import { App } from './App.jsx';

// main.jsx
// Client entry point.
// Renders the React application after
// the Meteor client has finished loading.

Meteor.startup(() => {

    ReactDOM.createRoot(
        document.getElementById('root')
    ).render(

        <React.StrictMode>

            <App />

        </React.StrictMode>

    );

});