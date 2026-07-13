import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { CreateListingModal } from './components/CreateListingModal';
import '../styles/CreateListingModal.css';

// CreateListingModal.jsx
// Displays a modal dialog that allows users
// to create a new marketplace listing.

export const CreateListingModal = ({
    onClose,
    onSubmit
}) => {

    // Stores the listing title entered by the user.
    const [title, setTitle] = useState('');

    // Stores the listing price.
    const [price, setPrice] = useState('');

    // Stores the selected product category.
    const [category, setCategory] = useState('Books');

    // Stores the product description.
    const [description, setDescription] = useState('');

    // Handles the form submission.
    // Collects all entered information and
    // passes the listing object to the parent component.
    const handleSubmit = (event) => {

        event.preventDefault();

        const listing = {

            title,
            price,
            category,
            description

        };

        if (typeof onSubmit === 'function') {

            onSubmit(listing);

        }

        // Close the dialog after submitting the form.
        if (typeof onClose === 'function') {

            onClose();

        }

    };

    return (

        <div className="modal-overlay">

            <div className="create-modal">

                <h2>
                    Create New Listing
                </h2>

                <form
                    onSubmit={handleSubmit}
                >

                    {/* Product title */}

                    <label htmlFor="title">
                        Title
                    </label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                        required
                    />

                    {/* Product price */}

                    <label htmlFor="price">
                        Price
                    </label>

                    <input
                        id="price"
                        type="text"
                        value={price}
                        onChange={(event) =>
                            setPrice(event.target.value)
                        }
                        required
                    />

                    {/* Product category */}

                    <label htmlFor="category">
                        Category
                    </label>

                    <select
                        id="category"
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                    >

                        <option>
                            Books
                        </option>

                        <option>
                            Electronics
                        </option>

                        <option>
                            Home Goods
                        </option>

                    </select>

                    {/* Product description */}

                    <label htmlFor="description">
                        Description
                    </label>

                    <textarea

                        id="description"

                        rows="5"

                        value={description}

                        onChange={(event) =>
                            setDescription(event.target.value)
                        }

                    />

                    {/* Form action buttons */}

                    <div className="modal-buttons">

                        <button

                            type="button"

                            className="cancel-button"

                            onClick={onClose}

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="submit-button"

                        >

                            Submit

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};