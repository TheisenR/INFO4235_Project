import React, { useEffect, useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const HomePage = ({ user, onLogout, onProfile, onWishlist, onReview, onViewDetails, onCreateListing, onMyListings }) => {
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

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

  const getListingStatus = (item) => {
    const statusValue = (item?.status || 'Available').toString().toLowerCase();

    if (statusValue === 'reserved') {
      return 'Reserved';
    }

    if (statusValue === 'sold') {
      return 'Sold';
    }

    return 'Available';
  };

  const getStatusStyle = (status) => {
    if (status === 'Sold') {
      return styles.statusSold;
    }

    if (status === 'Reserved') {
      return styles.statusReserved;
    }

    return styles.statusAvailable;
  };

  const itemTypeOptions = useMemo(() => {
    const types = new Set();

    listings.forEach((item) => {
      const itemType = item?.type || item?.category || 'General';
      types.add(itemType);
    });

    return ['all', ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  }, [listings]);

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return listings.filter((item) => {
      const title = (item?.title || item?.name || '').toLowerCase();
      const description = (item?.description || '').toLowerCase();
      const category = (item?.category || '').toLowerCase();
      const type = (item?.type || '').toLowerCase();
      const status = (item?.status || 'available').toLowerCase();
      const price = String(item?.price || '').toLowerCase();
      const location = (item?.location || '').toLowerCase();

      const matchesType = selectedType === 'all'
        || (item?.type || item?.category || 'General') === selectedType;

      const matchesQuery = !normalizedQuery
        || title.includes(normalizedQuery)
        || description.includes(normalizedQuery)
        || category.includes(normalizedQuery)
        || type.includes(normalizedQuery)
        || status.includes(normalizedQuery)
        || price.includes(normalizedQuery)
        || location.includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [listings, searchQuery, selectedType]);

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Student Marketplace</h1>

        <div style={styles.navActions}>
          <span style={styles.welcome}>Welcome, <strong>{username}</strong></span>
          <button onClick={onWishlist} style={styles.wishlistNavBtn}>Wishlist</button>
          <button onClick={onReview} style={styles.reviewBtn}>Reviews</button>

          <div style={styles.accountMenuWrap}>
            <button
              onClick={() => setShowAccountMenu((prev) => !prev)}
              style={styles.accountBtn}
            >
              Account ▾
            </button>

            {showAccountMenu && (
              <div style={styles.accountDropdown}>
                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowAccountMenu(false);
                    if (typeof onProfile === 'function') {
                      onProfile();
                    }
                  }}
                >
                  Manage Account
                </button>

                <button
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowAccountMenu(false);
                    if (typeof onMyListings === 'function') {
                      onMyListings();
                    }
                  }}
                >
                  My Listings
                </button>

                <button
                  style={styles.dropdownLogoutItem}
                  onClick={() => {
                    setShowAccountMenu(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.headerArea}>
          <h2>Current Marketplace Listings</h2>
          <button
            style={styles.createBtn}
            onClick={() => {
              if (typeof onCreateListing === 'function') {
                onCreateListing();
              }
            }}
          >
            + New Listing
          </button>
        </div>

        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search products by title, description, category, location, or price"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={styles.searchInput}
          />

          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            style={styles.typeSelect}
          >
            {itemTypeOptions.map((typeOption) => (
              <option key={typeOption} value={typeOption}>
                {typeOption === 'all' ? 'All Item Types' : typeOption}
              </option>
            ))}
          </select>

          {(searchQuery || selectedType !== 'all') && (
            <button
              style={styles.clearFiltersBtn}
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {!loadingListings && !listingsError && (
          <p style={styles.resultCountText}>
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        )}

        <div style={styles.grid}>
          {loadingListings && <p style={styles.statusText}>Loading listings...</p>}

          {!loadingListings && listingsError && (
            <p style={styles.statusError}>{listingsError}</p>
          )}

          {!loadingListings && !listingsError && listings.length === 0 && (
            <p style={styles.statusText}>No listings available yet.</p>
          )}

          {!loadingListings && !listingsError && listings.length > 0 && filteredListings.length === 0 && (
            <p style={styles.statusText}>No listings matched your search and filters.</p>
          )}

          {!loadingListings && !listingsError && filteredListings.map((item) => {
            const listingId = normalizeListingId(item?.id) || normalizeListingId(item?._id);
            const title = item?.title || item?.name || 'Untitled Listing';
            const category = item?.type || item?.category || 'General';
            const status = getListingStatus(item);
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
                {item?.imageUrl ? (
                  <img src={item.imageUrl} alt={title} style={styles.cardImage} />
                ) : (
                  <div style={styles.imageFallback}>No Image</div>
                )}
                <div style={styles.categoryBadge}>{category}</div>
                <div style={{ ...styles.statusBadge, ...getStatusStyle(status) }}>{status}</div>
                <h3 style={styles.cardTitle}>{title}</h3>
                <p style={styles.cardPrice}>{price}</p>

                <button
                  style={styles.viewBtn}
                  onClick={() => {
                    if (listingId && typeof onViewDetails === 'function') {
                      onViewDetails(listingId);
                    }
                  }}
                >
                  View Details
                </button>

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
  wishlistNavBtn: { backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  reviewBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  accountMenuWrap: { position: 'relative' },
  accountBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  accountDropdown: { position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: '180px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 12px 25px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 10 },
  dropdownItem: { width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fff', color: '#111827', padding: '10px 12px', cursor: 'pointer' },
  dropdownLogoutItem: { width: '100%', textAlign: 'left', border: 'none', backgroundColor: '#fff5f5', color: '#b91c1c', padding: '10px 12px', cursor: 'pointer', fontWeight: 'bold' },
  main: { padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' },
  headerArea: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  createBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' },
  searchInput: { flex: '1 1 420px', minWidth: '260px', border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', color: '#111827' },
  typeSelect: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', backgroundColor: '#fff', color: '#111827', minWidth: '170px' },
  clearFiltersBtn: { border: '1px solid #d1d5db', borderRadius: '6px', padding: '10px 14px', backgroundColor: '#fff', color: '#1f2937', fontWeight: 600, cursor: 'pointer' },
  resultCountText: { margin: '0 0 18px 0', color: '#4b5563', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardImage: { width: '100%', height: '170px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px', backgroundColor: '#f3f4f6' },
  imageFallback: { width: '100%', height: '170px', borderRadius: '6px', marginBottom: '12px', backgroundColor: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', marginBottom: '12px' },
  statusBadge: { display: 'inline-block', fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', marginBottom: '12px', marginLeft: '8px' },
  statusAvailable: { backgroundColor: '#dcfce7', color: '#166534' },
  statusReserved: { backgroundColor: '#fef3c7', color: '#92400e' },
  statusSold: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  cardTitle: { fontSize: '18px', margin: '0 0 10px 0', color: '#1f2937' },
  cardPrice: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 15px 0' },
  statusText: { gridColumn: '1 / -1', color: '#4b5563', margin: 0 },
  statusError: { gridColumn: '1 / -1', color: '#b91c1c', margin: 0 },
  viewBtn: { width: '100%', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', marginBottom: '10px' },
  wishlistCardBtn: { width: '100%', backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer' }
};