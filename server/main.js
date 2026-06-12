import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

const Users = new Mongo.Collection('Users');

Meteor.startup(() => {
  console.log('Meteor server started');
  console.log('MONGO_URL=', process.env.MONGO_URL || '<not set>');
});

Meteor.methods({
  async 'customLogin'(email, password) {
    check(email, String);
    check(password, String);

    const user = await Users.findOneAsync({
      $or: [
        { 'emails.address': email },
        { email },
        { username: email }
      ]
    });

    if (!user) {
      throw new Meteor.Error('not-found', 'No account found with that email address.');
    }

    let valid = { error: true };
    if (user.services?.password) {
      valid = Accounts._checkPassword(user, password);
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
  }
});
