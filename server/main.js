import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

// Keep handles for both common collection names: Meteor's default (`users`) and a capitalized `Users`.
const UsersLower = Meteor.users; // standard Meteor users collection (usually 'users')
const UsersUpper = new Mongo.Collection('Users'); // some databases may use capitalized 'Users'

Meteor.startup(() => {
  console.log('Meteor server started');
  console.log('MONGO_URL=', process.env.MONGO_URL || 'mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority');
});

Meteor.methods({
  async 'customLogin'(email, password) {
    try {
      check(email, String);
      check(password, String);

      console.log('customLogin: looking up user for', email);

      // Try the standard Meteor users collection first (lowercase 'users')
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

      // If not found, try a capitalized 'Users' collection (some DBs use that)
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
        throw new Meteor.Error('not-found', 'No account found with that email address.');
      }

      let valid = { error: true };
      if (user.services && user.services.password) {
        try {
          valid = Accounts._checkPassword(user, password);
        } catch (err) {
          console.log('customLogin: _checkPassword error', err);
        }
      }

      if (!valid.error) {
        return {
          success: true,
          user: {
            _id: user._id,
            emails: user.emails,
            username: user.username
          }
        };
      }

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

      throw new Meteor.Error('invalid', 'Invalid email or password');
    } catch (err) {
      console.error('customLogin: unexpected error', err && err.stack ? err.stack : err);
      // Return a controlled internal error to the client
      throw new Meteor.Error('internal', 'Internal server error');
    }
  }
});
