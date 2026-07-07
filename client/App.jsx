// App.jsx
// Main entry React component for the client-side app.
// Holds the top-level authentication state and switches
// between the `LoginPage` and `HomePage` based on whether
// a user is currently logged in.

import React, { useState } from 'react';
import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx';
import { RegisterPage } from './RegisterPage.jsx';
import { ProfilePage } from './ProfilePage.jsx';
import { WishlistPage } from './WishlistPage.jsx';
import { ReviewPage } from './ReviewPage.jsx';

export const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (!currentUser && currentPage === 'register') {
    return <RegisterPage onBack={() => setCurrentPage('login')} />;
  }

  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() => setCurrentPage('register')}
      />
    );
  }

  if (currentPage === 'profile') {
    return <ProfilePage user={currentUser} onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'wishlist') {
    return <WishlistPage user={currentUser} onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'review') {
    return <ReviewPage user={currentUser} onBack={() => setCurrentPage('home')} />;
  }

  return (
    <HomePage
      user={currentUser}
      onLogout={handleLogout}
      onProfile={() => setCurrentPage('profile')}
      onWishlist={() => setCurrentPage('wishlist')}
      onReview={() => setCurrentPage('review')}
    />
  );
};