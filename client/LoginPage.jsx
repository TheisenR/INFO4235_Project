import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import './styles/LoginPage.css';

// LoginPage.jsx
// Displays the user login page.
// Authenticates users through a Meteor server method and
// notifies the parent component after a successful login.

export const LoginPage = ({ onLogin }) => {

    // Stores the email entered by the user.
    const [email, setEmail] = useState('');

    // Stores the password entered by the user.
    const [password, setPassword] = useState('');

    // Stores the current login error message.
    const [error, setError] = useState('');

    // Handles the login form submission.
    // Calls the Meteor customLogin method and
    // returns the authenticated user on success.
    const handleSubmit = (event) => {

        event.preventDefault();

        // Clear any previous error messages.
        setError('');

        Meteor.call(
            'customLogin',
            email,
            password,
            (err, result) => {

                if (err) {

                    // Display a readable server error.
                    setError(err.reason || 'Invalid credentials');
                    return;

                }

                if (result?.success) {

                    // Notify the parent component that
                    // authentication completed successfully.
                    onLogin(
                        result.user || {
                            emails: [{ address: email }],
                            username: email
                        }
                    );

                }
                else {

                    // Display a generic login error.
                    setError('Invalid credentials');

                }

            }
        );

    };

    return (

        <div className="login-container">

            <div className="login-card">

                <h2 className="login-title">
                    Student Marketplace
                </h2>

                <p className="login-subtitle">
                    Sign in with your student email
                </p>

                {/* Displays an error message if authentication fails */}
                {error && (

                    <p className="error-message">
                        {error}
                    </p>

                )}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* Email Address */}
                    <div className="input-group">

                        <label
                            className="input-label"
                            htmlFor="email"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            className="input-field"
                            placeholder="yourname@school.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                    </div>

                    {/* Password */}
                    <div className="input-group">

                        <label
                            className="input-label"
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                    >
                        Sign In
                    </button>

                </form>

            </div>

        </div>

    );

};