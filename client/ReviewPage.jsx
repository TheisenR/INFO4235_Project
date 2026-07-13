import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const ReviewPage = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('write');
  const [sellerEmail, setSellerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsAboutMe, setReviewsAboutMe] = useState([]);
  const [message, setMessage] = useState('');
  const [editingReviewId, setEditingReviewId] = useState('');
  const [savingReviewId, setSavingReviewId] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState('');
  const reviewerEmail = user?.emails?.[0]?.address || user?.username || '';

  const loadMyReviews = () => {
    Meteor.call('getMyAuthoredReviews', (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load your reviews.');
      } else {
        setMyReviews(Array.isArray(res) ? res : []);
      }
    });
  };

  const loadReviewsAboutMe = () => {
    Meteor.call('getMyReviews', (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load reviews about you.');
      } else {
        setReviewsAboutMe(Array.isArray(res) ? res : []);
      }
    });
  };

  useEffect(() => {
    if (activeTab === 'write') {
      loadMyReviews();
    } else {
      loadReviewsAboutMe();
    }
  }, [activeTab]);

  const handleSubmit = (e) => {
    e.preventDefault();

    Meteor.call(
      'addReview',
      {
        sellerEmail,
        rating: Number(rating),
        comment,
        reviewerEmail
      },
      (err) => {
        if (err) {
          setMessage(err.reason || 'Failed to submit review.');
        } else {
          setMessage('Review submitted successfully.');
          setSellerEmail('');
          setRating(5);
          setComment('');
          loadMyReviews();
        }
      }
    );
  };

  const startEditingReview = (review) => {
    setMessage('');
    setEditingReviewId(review._id);
    setSellerEmail(review.sellerEmail || '');
    setRating(review.rating || 5);
    setComment(review.comment || '');
  };

  const cancelEditingReview = () => {
    setEditingReviewId('');
    setSellerEmail('');
    setRating(5);
    setComment('');
  };

  const handleUpdateReview = (reviewId) => {
    if (!reviewId || savingReviewId) {
      return;
    }

    if (!sellerEmail.trim() || !comment.trim()) {
      setMessage('Seller email and comment are required.');
      return;
    }

    setSavingReviewId(reviewId);
    setMessage('');

    Meteor.call(
      'updateReview',
      reviewId,
      {
        sellerEmail: sellerEmail.trim(),
        rating: Number(rating),
        comment: comment.trim()
      },
      (err) => {
        setSavingReviewId('');

        if (err) {
          setMessage(err.reason || 'Failed to update review.');
          return;
        }

        setMessage('Review updated successfully.');
        cancelEditingReview();
        loadMyReviews();
      }
    );
  };

  const handleDeleteReview = (reviewId) => {
    if (!reviewId || deletingReviewId) {
      return;
    }

    if (!window.confirm('Delete this review? This cannot be undone.')) {
      return;
    }

    setDeletingReviewId(reviewId);
    setMessage('');

    Meteor.call('deleteReview', reviewId, (err) => {
      setDeletingReviewId('');

      if (err) {
        setMessage(err.reason || 'Failed to delete review.');
        return;
      }

      if (editingReviewId === reviewId) {
        cancelEditingReview();
      }

      setMessage('Review deleted successfully.');
      loadMyReviews();
    });
  };

  const averageRating =
    myReviews.length > 0
      ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
      : 'No ratings yet';

  const averageAboutMeRating =
    reviewsAboutMe.length > 0
      ? (reviewsAboutMe.reduce((sum, r) => sum + r.rating, 0) / reviewsAboutMe.length).toFixed(1)
      : 'No ratings yet';

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.homeBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.tabBar}>
            <button
              style={activeTab === 'write' ? styles.activeTabBtn : styles.tabBtn}
              type="button"
              onClick={() => setActiveTab('write')}
            >
              Write Review
            </button>
            <button
              style={activeTab === 'about-me' ? styles.activeTabBtn : styles.tabBtn}
              type="button"
              onClick={() => setActiveTab('about-me')}
            >
              Reviews About Me
            </button>
          </div>

          {activeTab === 'write' ? (
            <>
              <h2>Seller Review and Rating</h2>
              <p style={styles.subtitle}>Average Rating: {averageRating}</p>

              {message && <p style={styles.message}>{message}</p>}

              <form onSubmit={handleSubmit}>
                <label>Seller Email</label>
                <input
                  style={styles.input}
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="seller@student.kpu.ca"
                  required
                />

                <label>Rating</label>
                <select
                  style={styles.input}
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                  <option value="3">⭐⭐⭐ 3 - Average</option>
                  <option value="2">⭐⭐ 2 - Poor</option>
                  <option value="1">⭐ 1 - Very Poor</option>
                </select>

                <label>Comment</label>
                <textarea
                  style={styles.textarea}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your feedback..."
                  required
                />

                <button style={styles.submitBtn}>Submit Review</button>
              </form>

              <div style={styles.reviewSection}>
                <h3 style={styles.sectionTitle}>My Reviews</h3>

                {myReviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  myReviews.map((review) => (
                    <div key={review._id} style={styles.reviewBox}>
                      {editingReviewId === review._id ? (
                        <>
                          <label>Seller Email</label>
                          <input
                            style={styles.input}
                            value={sellerEmail}
                            onChange={(e) => setSellerEmail(e.target.value)}
                          />

                          <label>Rating</label>
                          <select
                            style={styles.input}
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                          >
                            <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                            <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                            <option value="3">⭐⭐⭐ 3 - Average</option>
                            <option value="2">⭐⭐ 2 - Poor</option>
                            <option value="1">⭐ 1 - Very Poor</option>
                          </select>

                          <label>Comment</label>
                          <textarea
                            style={styles.textarea}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />

                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              style={styles.saveBtn}
                              onClick={() => handleUpdateReview(review._id)}
                              disabled={savingReviewId === review._id}
                            >
                              {savingReviewId === review._id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              style={styles.cancelBtn}
                              onClick={cancelEditingReview}
                              disabled={savingReviewId === review._id}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p><strong>Seller:</strong> {review.sellerEmail}</p>
                          <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
                          <p><strong>Comment:</strong> {review.comment}</p>
                          <p style={styles.smallText}>Reviewed by: {review.reviewerEmail}</p>

                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              style={styles.editBtn}
                              onClick={() => startEditingReview(review)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              style={styles.deleteBtn}
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={deletingReviewId === review._id}
                            >
                              {deletingReviewId === review._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h2>Reviews About Me</h2>
              <p style={styles.subtitle}>Average Rating: {averageAboutMeRating}</p>
              <p style={styles.smallText}>Using account email: {reviewerEmail || 'Not available'}</p>

              {reviewsAboutMe.length === 0 ? (
                <p>No reviews about you yet.</p>
              ) : (
                reviewsAboutMe.map((review) => (
                  <div key={review._id} style={styles.reviewBox}>
                    <p><strong>Seller:</strong> {review.sellerEmail}</p>
                    <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
                    <p><strong>Comment:</strong> {review.comment}</p>
                    <p style={styles.smallText}>Reviewed by: {review.reviewerEmail}</p>
                  </div>
                ))
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '15px 30px', color: '#fff' },
  logo: { fontSize: '20px', margin: 0 },
  homeBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  main: { padding: '40px 30px', maxWidth: '900px', margin: '0 auto' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '25px' },
  tabBar: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tabBtn: { border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', padding: '8px 12px', borderRadius: '999px', cursor: 'pointer' },
  activeTabBtn: { border: '1px solid #2563eb', backgroundColor: '#2563eb', color: '#fff', padding: '8px 12px', borderRadius: '999px', cursor: 'pointer', fontWeight: 'bold' },
  subtitle: { color: '#6b7280' },
  input: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '90px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  message: { padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' },
  reviewBox: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', marginBottom: '15px' },
  reviewSection: { marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' },
  sectionTitle: { margin: '0 0 16px 0', color: '#111827' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '10px' },
  editBtn: { flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, backgroundColor: '#6b7280', color: '#fff', border: 'none', padding: '9px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  smallText: { color: '#6b7280', fontSize: '13px' }
};