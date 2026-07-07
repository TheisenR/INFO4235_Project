import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const ReviewPage = ({ user, onBack }) => {
  const [sellerEmail, setSellerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState('');

  const loadReviews = () => {
    Meteor.call('getReviews', (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load reviews.');
      } else {
        setReviews(res || []);
      }
    });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    Meteor.call(
      'addReview',
      {
        sellerEmail,
        rating: Number(rating),
        comment,
        reviewerEmail: user?.emails?.[0]?.address || user?.username
      },
      (err) => {
        if (err) {
          setMessage(err.reason || 'Failed to submit review.');
        } else {
          setMessage('Review submitted successfully.');
          setSellerEmail('');
          setRating(5);
          setComment('');
          loadReviews();
        }
      }
    );
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'No ratings yet';

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.homeBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
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
        </div>

        <div style={styles.card}>
          <h2>Review List</h2>

          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} style={styles.reviewBox}>
                <p><strong>Seller:</strong> {review.sellerEmail}</p>
                <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
                <p><strong>Comment:</strong> {review.comment}</p>
                <p style={styles.smallText}>Reviewed by: {review.reviewerEmail}</p>
              </div>
            ))
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
  subtitle: { color: '#6b7280' },
  input: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', margin: '8px 0 16px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '90px', boxSizing: 'border-box' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  message: { padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' },
  reviewBox: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', marginBottom: '15px' },
  smallText: { color: '#6b7280', fontSize: '13px' }
};