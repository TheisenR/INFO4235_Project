import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const RegisterPage = ({ onBack }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    Meteor.call('customRegister', username, email, password, (err, res) => {
      if (err) {
        setMessage(err.reason || 'Registration failed.');
        return;
      }

      if (res?.success) {
        alert('Registration successful! Please sign in.');
        onBack();
      }
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Student Marketplace</h2>
        <p style={styles.subtitle}>Create a new account</p>

        {message && <p style={styles.errorText}>{message}</p>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Please enter your username"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@school.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter your password"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Please confirm your password"
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>Register</button>

          <button type="button" onClick={onBack} style={styles.backButton}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fb', fontFamily: 'system-ui, sans-serif' },
  card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '24px' },
  subtitle: { margin: '0 0 30px 0', color: '#666', fontSize: '14px' },
  errorText: { color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', fontSize: '14px', marginBottom: '15px', textAlign: 'left' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' },
  button: { width: '100%', padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  backButton: { width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#0066cc', border: '1px solid #0066cc', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }
};