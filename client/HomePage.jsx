import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { CreateListingModal } from './components/CreateListingModal';
import './styles/HomePage.css';

// HomePage.jsx
// Main marketplace page displayed after a successful login.
// Allows users to browse, search, create, and view marketplace listings.

export const HomePage = ({ user, onLogout }) => {

    // Temporary marketplace listings used for development.
    // These records will later be replaced with data from MongoDB.
    const listings = [
        {
            id: 1,
            title: "Textbook: Intro to Cloud Computing",
            price: "$45",
            category: "Books",
            seller: "William",
            description:
                "A well-maintained cloud computing textbook with minimal highlighting."
        },
        {
            id: 2,
            title: "PlayStation 5 Controller - Mint Condition",
            price: "$50",
            category: "Electronics",
            seller: "Alex",
            description:
                "Official PS5 controller in excellent condition with no visible damage."
        },
        {
            id: 3,
            title: "Desk Lamp (LED with USB Port)",
            price: "$15",
            category: "Home Goods",
            seller: "Emily",
            description:
                "Modern LED desk lamp with adjustable brightness and built-in USB charging port."
        }
    ];

    // Stores the current search keyword.
    const [searchTerm, setSearchTerm] = useState('');

    // Stores the selected category.
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Stores the currently selected product.
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Displays the user's email if available.
    const email =
        user?.emails?.[0]?.address ||
        user?.username ||
        'Student';

    // Controls the Create Listing dialog.
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Stores the Create Listing form values.
    const [newListing, setNewListing] = useState({
        title: '',
        price: '',
        category: 'Books',
        seller: email,
        description: ''
    });

    // Handles user logout.
    const handleLogout = () => {
        if (typeof onLogout === 'function') {
            onLogout();
        }
    };

    // Sends a new listing to the server.
    const handleCreateListing = (listing) => {
        Meteor.call(
            'createListing',
            {
                ...listing,
                seller: email
            },
            (error) => {
                if (error) {
                    alert(error.reason);
                    return;
                }

                alert('Listing created successfully.');
            }
        );
    };

    // Filters marketplace listings.
    const filteredListings = listings.filter((item) => {

        const matchesSearch =
            item.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === 'All' ||
            item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Available categories.
    const categories = [
        'All',
        'Books',
        'Electronics',
        'Home Goods'
    ];

    return (

        <div className="container">

            {/* Navigation Bar */}
            <nav className="navbar">

                <h1 className="logo">
                    Student Marketplace
                </h1>

                <div className="nav-actions">

                    <span className="welcome">
                        Welcome, <strong>{email}</strong>
                    </span>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* Main Content */}
            <main className="main-content">

                {/* Search */}
                <section className="search-section">

                    <label
                        htmlFor="search"
                        className="search-label"
                    >
                        Search
                    </label>

                    <input
                        id="search"
                        type="text"
                        className="search-input"
                        placeholder="Search for products..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                </section>

                {/* Header */}
                <section className="header-section">

                    <h2 className="page-title">
                        Current Marketplace Listings
                    </h2>

                    <button
                        type="button"
                        className="create-button"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New Listing
                    </button>

                </section>

                {/* Category Filter */}
                <section className="filter-section">

                    <label
                        htmlFor="category"
                        className="filter-label"
                    >
                        Category
                    </label>

                    <select
                        id="category"
                        className="category-select"
                        value={selectedCategory}
                        onChange={(event) =>
                            setSelectedCategory(event.target.value)
                        }
                    >

                        {categories.map((category) => (

                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>

                        ))}

                    </select>

                </section>

                {/* Marketplace Listings */}
                <section className="listing-grid">

                    {filteredListings.length > 0 ? (

                        filteredListings.map((item) => (

                            <div
                                key={item.id}
                                className="listing-card"
                            >

                                <div className="category-badge">
                                    {item.category}
                                </div>

                                <h3 className="listing-title">
                                    {item.title}
                                </h3>

                                <p className="listing-price">
                                    {item.price}
                                </p>

                                <p className="listing-seller">
                                    Seller: {item.seller}
                                </p>

                                <button
                                    type="button"
                                    className="details-button"
                                    onClick={() => setSelectedProduct(item)}
                                >
                                    View Details
                                </button>

                            </div>

                        ))

                    ) : (

                        <p className="empty-message">
                            No listings match your search.
                        </p>

                    )}

                </section>

            </main>

            {/* Product Detail Dialog */}
            {selectedProduct && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2 className="modal-title">
                            {selectedProduct.title}
                        </h2>

                        <div className="modal-content">

                            <p>
                                <strong>Category:</strong> {selectedProduct.category}
                            </p>

                            <p>
                                <strong>Price:</strong> {selectedProduct.price}
                            </p>

                            <p>
                                <strong>Seller:</strong> {selectedProduct.seller}
                            </p>

                            <p>
                                <strong>Description:</strong>
                            </p>

                            <p className="description">
                                {selectedProduct.description}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="close-button"
                            onClick={() => setSelectedProduct(null)}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

            {/* Create Listing Dialog */}
            {showCreateModal && (
                <CreateListingModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateListing}
                />
            )}

        </div>

    );

};