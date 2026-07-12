import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const WishlistPage = ({ user, onBack }) => {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  const loadWishlist = () => {
    Meteor.call('getWishlist', (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load wishlist.');
      } else {
        setItems(res || []);
      }
    });
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = (wishlistId) => {
    Meteor.call('removeWishlist', wishlistId, (err) => {
      if (err) {
        setMessage(err.reason || 'Remove failed.');
      } else {
        setMessage('Item removed from wishlist.');
        loadWishlist();
      }
    });
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.homeBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        <h2>My Wishlist</h2>
        <p style={styles.subtitle}>Saved items: {items.length}</p>

        {message && <p style={styles.message}>{message}</p>}

        {items.length === 0 ? (
          <div style={styles.emptyBox}>
            <h3>No items saved yet</h3>
            <p>Go back to the marketplace and add items to your wishlist.</p>
            <button onClick={onBack} style={styles.emptyBtn}>Browse Listings</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item._id} style={styles.card}>
                <div style={styles.categoryBadge}>{item.product.category}</div>
                <h3 style={styles.cardTitle}>{item.product.title}</h3>
                <p style={styles.price}>{item.product.price}</p>
                <p style={styles.savedText}>❤️ Saved to wishlist</p>

                <button
                  onClick={() => handleRemove(item._id)}
                  style={styles.removeBtn}
                >
                  Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '15px 30px', color: '#fff' },
  logo: { fontSize: '20px', margin: 0 },
  homeBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  main: { padding: '40px 30px', maxWidth: '1100px', margin: '0 auto' },
  subtitle: { color: '#6b7280', marginBottom: '25px' },
  message: { padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', marginBottom: '20px' },
  emptyBox: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '40px', textAlign: 'center' },
  emptyBtn: { marginTop: '15px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' },
  categoryBadge: { display: 'inline-block', backgroundColor: '#ede9fe', color: '#6d28d9', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#1f2937' },
  price: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' },
  savedText: { color: '#7c3aed', fontSize: '14px', marginBottom: '15px' },
  removeBtn: { width: '100%', padding: '9px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};