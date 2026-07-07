import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const ProfilePage = ({ user, onBack }) => {
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || user?.username || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [message, setMessage] = useState('');

  const email = user?.emails?.[0]?.address || user?.username || '';

  const handleSave = (e) => {
    e.preventDefault();

    Meteor.call('updateProfile', user._id, { displayName, bio, phone }, (err) => {
      if (err) {
        setMessage(err.reason || 'Update failed.');
      } else {
        setMessage('Profile updated successfully.');
      }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>My Profile</h2>
        <p>{email}</p>

        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSave}>
          <label>Display Name</label>
          <input style={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

          <label>Phone</label>
          <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Bio</label>
          <textarea style={styles.textarea} value={bio} onChange={(e) => setBio(e.target.value)} />

          <button style={styles.saveBtn}>Save Profile</button>
        </form>

        <button onClick={onBack} style={styles.backBtn}>Back to Home</button>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f7fb', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'system-ui, sans-serif' },
  card: { width: '420px', background: '#fff', padding: '35px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '90px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '12px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
  backBtn: { width: '100%', padding: '10px', marginTop: '12px', background: '#fff', color: '#0066cc', border: '1px solid #0066cc', borderRadius: '4px', fontWeight: 'bold' },
  message: { padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }
};