// App.jsx
// Main entry React component for the client-side app.
// Holds the top-level authentication state and switches
// between the `LoginPage` and `HomePage` based on whether
// a user is currently logged in.
import React, { useState } from 'react';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx';

export const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Called when `LoginPage` successfully authenticates a user.
  // Stores a minimal `user` object in local state so the app
  // can render authenticated views.
  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  // Clears the current user to return to the login view.
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If there is no logged-in user, show the login screen.
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // When a user is present, render the main marketplace page.
  return <HomePage user={currentUser} onLogout={handleLogout} />;
};
