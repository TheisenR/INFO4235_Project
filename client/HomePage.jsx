import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const HomePage = ({ user, onLogout, onProfile, onWishlist, onReview }) => {
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState('');

  const username = user?.username || user?.emails?.[0]?.address || 'Student';

  useEffect(() => {
    Meteor.call('getListings', (err, res) => {
      if (err) {
        setListingsError(err.reason || 'Failed to load listings.');
      } else {
        setListings(Array.isArray(res) ? res : []);
      }

      setLoadingListings(false);
    });
  }, []);

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const handleAddWishlist = (item) => {
    Meteor.call('addWishlist', item, (err) => {
      if (err) {
        alert(err.reason || 'Failed to add wishlist.');
      } else {
        alert('Added to wishlist!');
      }
    });
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>

        <div style={styles.navActions}>
          <span style={styles.welcome}>Welcome, <strong>{username}</strong></span>
          <button onClick={onProfile} style={styles.profileBtn}>Profile</button>
          <button onClick={onWishlist} style={styles.wishlistNavBtn}>Wishlist</button>
          <button onClick={onReview} style={styles.reviewBtn}>Reviews</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.headerArea}>
          <h2>Current Marketplace Listings</h2>
          <button style={styles.createBtn}>+ New Listing</button>
        </div>

        <div style={styles.grid}>
          {loadingListings && <p style={styles.statusText}>Loading listings...</p>}

          {!loadingListings && listingsError && (
            <p style={styles.statusError}>{listingsError}</p>
          )}

          {!loadingListings && !listingsError && listings.length === 0 && (
            <p style={styles.statusText}>No listings available yet.</p>
          )}

          {!loadingListings && !listingsError && listings.map((item) => {
            const listingId = item?.id || item?._id;
            const title = item?.title || item?.name || 'Untitled Listing';
            const category = item?.category || 'General';
            const rawPrice = item?.price;
            const price = typeof rawPrice === 'number'
              ? `$${rawPrice}`
              : (rawPrice || 'Price not listed');

            const wishlistItem = {
              ...item,
              id: listingId
            };

            return (
              <div key={listingId || title} style={styles.card}>
                <div style={styles.categoryBadge}>{category}</div>
                <h3 style={styles.cardTitle}>{title}</h3>
                <p style={styles.cardPrice}>{price}</p>

                <button style={styles.viewBtn}>View Details</button>

                <button
                  style={styles.wishlistCardBtn}
                  onClick={() => handleAddWishlist(wishlistItem)}
                >
                  ♡ Add to Wishlist
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '15px 30px', color: '#fff' },
  logo: { fontSize: '20px', margin: 0 },
  navActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  welcome: { fontSize: '14px' },
  profileBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  wishlistNavBtn: { backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  reviewBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  main: { padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' },
  headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  createBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#1f2937' },
  cardPrice: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 15px 0' },
  statusText: { gridColumn: '1 / -1', color: '#4b5563', margin: 0 },
  statusError: { gridColumn: '1 / -1', color: '#b91c1c', margin: 0 },
  viewBtn: { width: '100%', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', marginBottom: '10px' },
  wishlistCardBtn: { width: '100%', backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' }
};