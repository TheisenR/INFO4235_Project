import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

// Keep handles for both common collection names: Meteor's default (`users`) and a capitalized `Users`.
// Some MongoDB deployments (or imports) may have the collection named with a capital letter,
// so the code attempts to look users up in both.
const UsersLower = Meteor.users; // standard Meteor users collection (usually 'users')
const UsersUpper = new Mongo.Collection('Users'); // some databases may use capitalized 'Users'

// Log a simple startup message and the configured Mongo URL (if available).
Meteor.startup(() => {
  console.log('Meteor server started');
  console.log('MONGO_URL=', process.env.MONGO_URL || 'mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority');
});

// Define server methods accessible to clients. `customLogin` is a lightweight
// authentication helper that looks up a user by email/username and checks the password.
Meteor.methods({
  async 'customLogin'(email, password) {
    try {
      // Validate input types to avoid unexpected errors.
      check(email, String);
      check(password, String);

      console.log('customLogin: looking up user for', email);

      // Try to find the user in Meteor's default users collection first.
      let user = null;
      if (UsersLower) {
        user = await UsersLower.findOneAsync({
          $or: [
            { 'emails.address': email },
            { email },
            { username: email }
          ]
        });
        if (user) {
          console.log('customLogin: found in Meteor.users');
        }
      }

      // Fallback: try the capitalized 'Users' collection if no result.
      if (!user) {
        user = await UsersUpper.findOneAsync({
          $or: [
            { 'emails.address': email },
            { email },
            { username: email }
          ]
        });
        if (user) {
          console.log('customLogin: found in Users (capitalized)');
        }
      }

      console.log('customLogin: lookup result', !!user, user && { _id: user._id, username: user.username, emails: user.emails });

      if (!user) {
        // Inform the client that the account doesn't exist.
        throw new Meteor.Error('not-found', 'No account found with that email address.');
      }

      // By default try Meteor's secure password check if available.
      let valid = { error: true };
      if (user.services && user.services.password) {
        try {
          valid = Accounts._checkPassword(user, password);
        } catch (err) {
          console.log('customLogin: _checkPassword error', err);
        }
      }

      if (!valid.error) {
        // Password matched using Meteor's password hashing mechanism.
        return {
          success: true,
          user: {
            _id: user._id,
            emails: user.emails,
            username: user.username
          }
        };
      }

      // Fallback: if a legacy `user.password` field exists and matches plaintext.
      if (user.password && user.password === password) {
        return {
          success: true,
          user: {
            _id: user._id,
            emails: user.emails,
            username: user.username
          }
        };
      }

      // If none of the checks pass, return a standard invalid credentials error.
      throw new Meteor.Error('invalid', 'Invalid email or password');
    } catch (err) {
      console.error('customLogin: unexpected error', err && err.stack ? err.stack : err);
      // Return a controlled internal error to the client to avoid leaking details.
      throw new Meteor.Error('internal', 'Internal server error');
    }
  }
});
