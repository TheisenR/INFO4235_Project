import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const CreateListingPage = ({ user, onBack, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    category: '',
    price: '',
    condition: '',
    location: '',
    description: '',
    imageUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageName, setImageName] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Keep payloads manageable for Meteor method calls.
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be 3MB or smaller.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      if (!result.startsWith('data:image/')) {
        setError('Failed to read image file. Please try another file.');
        return;
      }

      setError('');
      setImageName(file.name);
      setForm((prev) => ({ ...prev, imageUrl: result }));
    };

    reader.onerror = () => {
      setError('Could not upload image. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!form.title.trim() || !form.category.trim() || !form.price.toString().trim() || !form.description.trim()) {
      setError('Please fill in title, category, price, and description.');
      return;
    }

    const parsedPrice = Number(form.price);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid non-negative number.');
      return;
    }

    setSubmitting(true);

    Meteor.call(
      'addListing',
      {
        title: form.title.trim(),
        category: form.category.trim(),
        price: parsedPrice,
        condition: form.condition.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim()
      },
      (err, res) => {
        setSubmitting(false);

        if (err) {
          setError(err.reason || 'Failed to create listing.');
          return;
        }

        setMessage('Listing created successfully.');

        if (typeof onCreated === 'function') {
          onCreated(res?.listingId || '');
        }
      }
    );
  };

  const userDisplay = user?.username || user?.emails?.[0]?.address || 'Seller';

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.backBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create New Listing</h2>
          <p style={styles.subtitle}>Selling as <strong>{userDisplay}</strong></p>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>Item Title</label>
            <input
              style={styles.input}
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Calculus Textbook"
              required
            />

            <label style={styles.label}>Category</label>
            <input
              style={styles.input}
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g. Books"
              required
            />

            <label style={styles.label}>Price (CAD)</label>
            <input
              style={styles.input}
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="e.g. 45"
              type="number"
              min="0"
              step="0.01"
              required
            />

            <label style={styles.label}>Condition</label>
            <input
              style={styles.input}
              value={form.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              placeholder="e.g. Like New"
            />

            <label style={styles.label}>Pickup Location</label>
            <input
              style={styles.input}
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. KPU Surrey Campus"
            />

            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add details about the item"
              required
            />

            <label style={styles.label}>Upload Image</label>
            <input
              style={styles.input}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {imageName && <p style={styles.helperText}>Selected file: {imageName}</p>}

            <label style={styles.label}>Or Image URL</label>
            <input
              style={styles.input}
              value={form.imageUrl}
              onChange={(e) => {
                setImageName('');
                handleChange('imageUrl', e.target.value);
              }}
              placeholder="https://example.com/item-photo.jpg"
            />

            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Listing preview" style={styles.imagePreview} />
            ) : null}

            <button style={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '15px 30px', color: '#fff' },
  logo: { fontSize: '20px', margin: 0 },
  backBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  main: { padding: '40px 20px' },
  card: { background: '#fff', maxWidth: '680px', margin: '0 auto', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '28px' },
  title: { marginTop: 0, marginBottom: '6px', color: '#111827' },
  subtitle: { marginTop: 0, color: '#4b5563', marginBottom: '24px' },
  form: { display: 'grid', gap: '10px' },
  label: { color: '#374151', fontWeight: 600, marginTop: '8px' },
  input: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' },
  textarea: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '100px', fontSize: '14px', resize: 'vertical' },
  helperText: { color: '#4b5563', fontSize: '13px', margin: '4px 0 0' },
  imagePreview: { width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', marginTop: '6px' },
  submitBtn: { marginTop: '12px', padding: '12px', border: 'none', borderRadius: '6px', backgroundColor: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  error: { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px', borderRadius: '6px' },
  success: { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '6px' }
};