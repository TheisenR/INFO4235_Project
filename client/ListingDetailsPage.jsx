import React, { useEffect, useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const ListingDetailsPage = ({ user, listingId, onBack }) => {
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [reserving, setReserving] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!listingId) {
      setLoading(false);
      setMessage('Listing not found.');
      return;
    }

    setLoading(true);
    setMessage('');

    Meteor.call('getListingDetails', listingId, (err, res) => {
      if (err) {
        setMessage(err.reason || 'Failed to load listing details.');
        setLoading(false);
        return;
      }

      setListing(res?.listing || null);
      setSeller(res?.seller || null);
      setLoading(false);
    });
  }, [listingId]);

  const displayTitle = useMemo(
    () => listing?.title || listing?.name || 'Untitled Listing',
    [listing]
  );

  const displayCategory = useMemo(
    () => listing?.category || 'General',
    [listing]
  );

  const displayStatus = useMemo(() => {
    const statusValue = (listing?.status || 'Available').toString().toLowerCase();

    if (statusValue === 'reserved') {
      return 'Reserved';
    }

    if (statusValue === 'sold') {
      return 'Sold';
    }

    return 'Available';
  }, [listing]);

  const statusStyle = useMemo(() => {
    if (displayStatus === 'Sold') {
      return styles.statusSold;
    }

    if (displayStatus === 'Reserved') {
      return styles.statusReserved;
    }

    return styles.statusAvailable;
  }, [displayStatus]);

  const displayPrice = useMemo(() => {
    const rawPrice = listing?.price;

    if (typeof rawPrice === 'number') {
      return `$${rawPrice}`;
    }

    return rawPrice || 'Price not listed';
  }, [listing]);

  const displayDescription = useMemo(
    () => listing?.description || listing?.details || 'No additional description was provided.',
    [listing]
  );

  const sellerDisplayName = useMemo(() => {
    if (!seller) {
      return 'Unknown seller';
    }

    return (
      seller.displayName
      || seller.fullName
      || seller.username
      || seller.email
      || 'Unknown seller'
    );
  }, [seller]);

  const isReservedByCurrentUser = useMemo(() => {
    if (!listing?.reservedBy || !user?._id) {
      return false;
    }

    return listing.reservedBy === user._id;
  }, [listing, user]);

  const canReserve = !reserving && !buying && displayStatus === 'Available';
  const canBuy = !buying && !reserving && (displayStatus === 'Available' || isReservedByCurrentUser);

  const handleReserve = () => {
    if (!listingId || !canReserve) {
      return;
    }

    setReserving(true);
    setActionMessage('');

    Meteor.call('reserveListing', listingId, (err, res) => {
      if (err) {
        setActionMessage(err.reason || 'Reserve request failed.');
      } else {
        setListing((prev) => {
          if (!prev) {
            return prev;
          }

          return { ...prev, status: 'Reserved', reservedBy: user?._id || prev.reservedBy };
        });
        setActionMessage(res?.message || 'Item reserved successfully.');
      }

      setReserving(false);
    });
  };

  const handleBuy = () => {
    if (!listingId || !canBuy) {
      return;
    }

    setBuying(true);
    setActionMessage('');

    Meteor.call('buyListing', listingId, (err, res) => {
      if (err) {
        setActionMessage(err.reason || 'Purchase failed.');
      } else {
        setListing((prev) => {
          if (!prev) {
            return prev;
          }

          return { ...prev, status: 'Sold', reservedBy: user?._id || prev.reservedBy };
        });
        setActionMessage(res?.message || 'Purchase completed successfully.');
      }

      setBuying(false);
    });
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>
        <button onClick={onBack} style={styles.homeBtn}>Back to Home</button>
      </nav>

      <main style={styles.main}>
        {loading && <p style={styles.statusText}>Loading listing details...</p>}

        {!loading && message && <p style={styles.statusError}>{message}</p>}

        {!loading && !message && listing && (
          <div style={styles.layout}>
            <section style={styles.detailsCard}>
              {listing?.imageUrl ? (
                <img src={listing.imageUrl} alt={displayTitle} style={styles.heroImage} />
              ) : (
                <div style={styles.heroImageFallback}>No Image Provided</div>
              )}
              <div style={styles.categoryBadge}>{displayCategory}</div>
              <div style={{ ...styles.statusBadge, ...statusStyle }}>{displayStatus}</div>
              <h2 style={styles.title}>{displayTitle}</h2>
              <p style={styles.price}>{displayPrice}</p>
              <p style={styles.description}>{displayDescription}</p>

              <div style={styles.metaList}>
                <p><strong>Condition:</strong> {listing?.condition || 'Not specified'}</p>
                <p><strong>Location:</strong> {listing?.location || 'Not specified'}</p>
                <p><strong>Posted:</strong> {listing?.createdAt ? new Date(listing.createdAt).toLocaleString() : 'Unknown'}</p>
              </div>

              <button
                onClick={handleReserve}
                style={styles.reserveBtn}
                disabled={!canReserve}
              >
                {reserving ? 'Reserving...' : 'Reserve Item'}
              </button>

              <button
                onClick={handleBuy}
                style={styles.buyBtn}
                disabled={!canBuy}
              >
                {buying ? 'Processing...' : 'Buy Item'}
              </button>

              {displayStatus !== 'Available' && !isReservedByCurrentUser && (
                <p style={styles.unavailableText}>This item is currently {displayStatus.toLowerCase()}.</p>
              )}

              {displayStatus === 'Reserved' && isReservedByCurrentUser && (
                <p style={styles.unavailableText}>This item is reserved by you. You can proceed to buy it.</p>
              )}

              {actionMessage && <p style={styles.purchaseMessage}>{actionMessage}</p>}
            </section>

            <aside style={styles.sellerCard}>
              <h3 style={styles.sellerHeading}>Seller Information</h3>
              <p><strong>Name:</strong> {sellerDisplayName}</p>
              <p><strong>Email:</strong> {seller?.email || 'Not available'}</p>
              <p><strong>Campus:</strong> {seller?.campus || 'Not provided'}</p>
              <p><strong>Institution:</strong> {seller?.institution || 'Not provided'}</p>
              <p><strong>Phone:</strong> {seller?.phone || 'Not provided'}</p>
            </aside>
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
  statusText: { color: '#4b5563', margin: 0 },
  statusError: { color: '#b91c1c', margin: 0 },
  layout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  detailsCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' },
  sellerCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', height: 'fit-content' },
  heroImage: { width: '100%', height: '290px', objectFit: 'cover', borderRadius: '8px', marginBottom: '14px', backgroundColor: '#f3f4f6' },
  heroImageFallback: { width: '100%', height: '290px', borderRadius: '8px', marginBottom: '14px', backgroundColor: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', marginBottom: '12px' },
  statusBadge: { display: 'inline-block', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', marginBottom: '12px', marginLeft: '8px' },
  statusAvailable: { backgroundColor: '#dcfce7', color: '#166534' },
  statusReserved: { backgroundColor: '#fef3c7', color: '#92400e' },
  statusSold: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  title: { margin: '0 0 10px', color: '#111827', fontSize: '30px' },
  price: { margin: '0 0 16px', fontSize: '24px', fontWeight: 'bold', color: '#111827' },
  description: { margin: '0 0 18px', color: '#374151', lineHeight: 1.5 },
  metaList: { marginBottom: '20px', color: '#374151', lineHeight: 1.5 },
  reserveBtn: { width: '100%', backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' },
  buyBtn: { width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  unavailableText: { marginTop: '10px', color: '#92400e', fontWeight: 600 },
  purchaseMessage: { marginTop: '12px', padding: '10px', borderRadius: '4px', background: '#ecfdf5', color: '#065f46' },
  sellerHeading: { marginTop: 0, color: '#111827' }
};