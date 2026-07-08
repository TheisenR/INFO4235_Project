import React, { useState } from 'react';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx';

// App.jsx
// Root component of the Student Marketplace application.
// Controls the authentication state and determines
// which page should be displayed.

export const App = () => {

    // Stores the currently authenticated user.
    // A null value indicates that no user is logged in.
    const [currentUser, setCurrentUser] = useState(null);

    // Handles a successful login.
    // Saves the authenticated user information
    // so the marketplace page can be displayed.
    const handleLogin = (user) => {

        setCurrentUser(user);

    };

    // Handles user logout.
    // Clears the current user and
    // returns the application to the login page.
    const handleLogout = () => {

        setCurrentUser(null);

    };

    // Display the login page when
    // there is no authenticated user.
    if (!currentUser) {

        return (

            <LoginPage
                onLogin={handleLogin}
            />

        );

    }

    // Display the marketplace after
    // the user has successfully logged in.
    return (

        <HomePage
            user={currentUser}
            onLogout={handleLogout}
        />

    );

};