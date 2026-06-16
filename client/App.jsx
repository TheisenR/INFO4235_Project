import React, { useState } from 'react';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx';

export const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <HomePage user={currentUser} onLogout={handleLogout} />;
};
