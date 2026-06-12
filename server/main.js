import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

Meteor.startup(() => {
  console.log('Meteor server started');
});

Meteor.methods({
  'users.login'(email, password) {
    check(email, String);
    check(password, String);

    const user = Accounts.findUserByEmail(email);
    if (!user) {
      throw new Meteor.Error('not-found', 'No account found with that email address.');
    }

    const valid = Accounts._checkPassword(user, password);
    if (!valid.error) {
      return { success: true, email };
    }

    throw new Meteor.Error('invalid', 'Invalid email or password');
  }
});
