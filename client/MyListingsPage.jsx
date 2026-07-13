import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const MyListingsPage = ({ user, onBack, onViewDetails }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    price: '',
    condition: '',
    location: '',
    description: '',
    imageUrl: ''
  });

  const normalizeListingId = (value) => {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      if (typeof value._str === 'string') {
        return value._str;
      }

      if (typeof value.$oid === 'string') {
        return value.$oid;
      }

      if (typeof value.toHexString === 'function') {
        return value.toHexString();
      }
    }

    return '';
  };

  const loadMyListings = () => {
    Meteor.call('getMyListings', (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load your listings.');
      } else {
        setMessage('');
        setListings(Array.isArray(res) ? res : []);
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    loadMyListings();
  }, []);

  const startEditing = (item) => {
    const listingId = normalizeListingId(item?.id) || normalizeListingId(item?._id);

    if (!listingId) {
      return;
    }

    setEditingId(listingId);
    setEditForm({
      title: item?.title || item?.name || '',
      category: item?.category || '',
      price: item?.price ?? '',
      condition: item?.condition || '',
      location: item?.location || '',
      description: item?.description || item?.details || '',
      imageUrl: item?.imageUrl || ''
    });
    setMessage('');
  };

  const handleSaveEdit = (listingId) => {
    if (!listingId || saving) {
      return;
    }

    const parsedPrice = Number(editForm.price);

    if (!editForm.title.trim() || !editForm.category.trim() || !editForm.description.trim()) {
      setMessage('Title, category, and description are required.');
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setMessage('Price must be a valid non-negative number.');
      return;
    }

    setSaving(true);
    setMessage('');

    Meteor.call(
      'updateListing',
      listingId,
      {
        title: editForm.title.trim(),
        category: editForm.category.trim(),
        price: parsedPrice,
        condition: editForm.condition.trim(),
        location: editForm.location.trim(),
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim()
      },
      (err) => {
        setSaving(false);

        if (err) {
          setMessage(err.reason || 'Failed to update listing.');
          return;
        }

        setEditingId('');
        setMessage('Listing updated successfully.');
        loadMyListings();
      }
    );
  };

  const handleDelete = (listingId) => {
    if (!listingId || deletingId) {
      return;
    }

    const shouldDelete = window.confirm('Delete this listing? This cannot be undone.');

    if (!shouldDelete) {
      return;
    }

    setDeletingId(listingId);
    setMessage('');

    Meteor.call('deleteListing', listingId, (err) => {
      setDeletingId('');

      if (err) {
        setMessage(err.reason || 'Failed to delete listing.');
        return;
      }

      if (editingId === listingId) {
        setEditingId('');
      }

      setMessage('Listing deleted successfully.');
      loadMyListings();
    });
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.homeBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        <h2>My Listings</h2>
        <p style={styles.subtitle}>Total listings: {listings.length}</p>

        {message && <p style={styles.error}>{message}</p>}
        {loading && <p style={styles.status}>Loading your listings...</p>}

        {!loading && !message && listings.length === 0 && (
          <div style={styles.emptyBox}>
            <h3>No listings yet</h3>
            <p>You have not posted any listings yet.</p>
          </div>
        )}

        {!loading && !message && listings.length > 0 && (
          <div style={styles.grid}>
            {listings.map((item) => {
              const listingId = normalizeListingId(item?.id) || normalizeListingId(item?._id);
              const title = item?.title || item?.name || 'Untitled Listing';
              const category = item?.category || 'General';
              const rawPrice = item?.price;
              const price = typeof rawPrice === 'number'
                ? `$${rawPrice}`
                : (rawPrice || 'Price not listed');

              return (
                <div key={listingId || title} style={styles.card}>
                  {item?.imageUrl ? (
                    <img src={item.imageUrl} alt={title} style={styles.cardImage} />
                  ) : (
                    <div style={styles.imageFallback}>No Image</div>
                  )}

                  <div style={styles.categoryBadge}>{category}</div>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <p style={styles.price}>{price}</p>

                  <div style={styles.buttonRow}>
                    <button
                      onClick={() => {
                        if (listingId && typeof onViewDetails === 'function') {
                          onViewDetails(listingId);
                        }
                      }}
                      style={styles.viewBtn}
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => startEditing(item)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(listingId)}
                      style={styles.deleteBtn}
                      disabled={deletingId === listingId}
                    >
                      {deletingId === listingId ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                  {editingId === listingId && (
                    <div style={styles.editPanel}>
                      <h4 style={styles.editHeading}>Edit Listing</h4>

                      <label style={styles.editLabel}>Title</label>
                      <input
                        style={styles.editInput}
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Category</label>
                      <input
                        style={styles.editInput}
                        value={editForm.category}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Price</label>
                      <input
                        style={styles.editInput}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Condition</label>
                      <input
                        style={styles.editInput}
                        value={editForm.condition}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, condition: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Location</label>
                      <input
                        style={styles.editInput}
                        value={editForm.location}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Description</label>
                      <textarea
                        style={styles.editTextarea}
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      />

                      <label style={styles.editLabel}>Image URL</label>
                      <input
                        style={styles.editInput}
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      />

                      <div style={styles.editActions}>
                        <button
                          style={styles.saveBtn}
                          onClick={() => handleSaveEdit(listingId)}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>

                        <button
                          style={styles.cancelBtn}
                          onClick={() => setEditingId('')}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
  main: { padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' },
  subtitle: { color: '#6b7280', marginBottom: '20px' },
  error: { color: '#b91c1c', marginBottom: '12px' },
  status: { color: '#4b5563', marginBottom: '12px' },
  emptyBox: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' },
  cardImage: { width: '100%', height: '170px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px', backgroundColor: '#f3f4f6' },
  imageFallback: { width: '100%', height: '170px', borderRadius: '6px', marginBottom: '12px', backgroundColor: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#1f2937' },
  price: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 12px 0' },
  buttonRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' },
  viewBtn: { backgroundColor: '#f3f4f6', color: '#374151', border: 'none', padding: '9px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' },
  editBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' },
  editPanel: { marginTop: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', backgroundColor: '#fafafa' },
  editHeading: { margin: '0 0 10px 0', color: '#1f2937' },
  editLabel: { display: 'block', fontSize: '13px', color: '#374151', marginBottom: '4px', marginTop: '8px' },
  editInput: { width: '100%', boxSizing: 'border-box', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' },
  editTextarea: { width: '100%', boxSizing: 'border-box', minHeight: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' },
  editActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  saveBtn: { flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, backgroundColor: '#6b7280', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }
};