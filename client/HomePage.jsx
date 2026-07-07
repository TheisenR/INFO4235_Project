import React, { useState } from 'react';
import './styles/HomePage.css';

// HomePage.jsx
// Main marketplace page displayed after a successful login.
// Allows users to browse, search, and view marketplace listings.

export const HomePage = ({ user, onLogout }) => {

    // Temporary product data.
    // These records will later be retrieved from MongoDB.
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

    // Stores the current search keyword entered by the user.
    const [searchTerm, setSearchTerm] = useState('');

    // Stores the currently selected category.
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Stores the selected product for the detail dialog.
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Signs the current user out by calling the callback
    // provided by the parent component.
    const handleLogout = () => {
        if (typeof onLogout === 'function') {
            onLogout();
        }
    };

    // Displays the user's email address if available.
    // Falls back to the username or a default label.
    const email =
        user?.emails?.[0]?.address ||
        user?.username ||
        'Student';

    // Create a new array containing only
    // the listings that match the current filters.
    const filteredListings = listings.filter((item) => {

        // Check whether the listing title contains the search keyword.
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Check whether the selected category matches the listing category.
        const matchesCategory =
            selectedCategory === 'All' ||
            item.category === selectedCategory;

        // Display the listing only if both conditions are satisfied.
        return matchesSearch && matchesCategory;
    });

    // Available product categories displayed in the filter menu.
    const categories = [
        'All',
        'Books',
        'Electronics',
        'Home Goods'
    ];

    return (

        // Container
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

                {/* Search Section */}
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

                {/* Marketplace Header */}
                <section className="header-section">

                    <h2 className="page-title">
                        Current Marketplace Listings
                    </h2>

                    <button
                        className="create-button"
                        type="button"
                    >
                        + New Listing
                    </button>

                </section>

                {/* Category Filter */}
                <section className="filter-section">

                    <label
                        className="filter-label"
                        htmlFor="category"
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

                {/* Marketplace listings */}
                <section className="listing-grid">

                    {filteredListings.length > 0 ? (

                        filteredListings.map((item) => (

                            <div
                                key={item.id}
                                className="listing-card"
                            >

                                {/* Displays the product category */}
                                <div className="category-badge">
                                    {item.category}
                                </div>

                                {/* Displays the product title */}
                                <h3 className="listing-title">
                                    {item.title}
                                </h3>

                                {/* Displays the product price */}
                                <p className="listing-price">
                                    {item.price}
                                </p>

                                {/* Displays the seller's name */}
                                <p className="listing-seller">
                                    Seller: {item.seller}
                                </p>

                                {/* Opens the product detail dialog */}
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
                            <strong>Category:</strong>
                            {' '}
                            {selectedProduct.category}
                        </p>

                        <p>
                            <strong>Price:</strong>
                            {' '}
                            {selectedProduct.price}
                        </p>

                        <p>
                            <strong>Seller:</strong>
                            {' '}
                            {selectedProduct.seller}
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

        </div>

    );
};