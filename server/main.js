import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import 'meteor/accounts-password';
import { check } from 'meteor/check';

Meteor.startup(() => {
  console.log('Meteor server started');

  const defaultEmail = 'john@students.kpu.ca';
  const defaultPassword = 'Password123!';

  const user = Accounts.findUserByEmail(defaultEmail);
  if (!user) {
    const userId = Accounts.createUser({
      email: defaultEmail,
      password: defaultPassword,
      profile: {
        name: 'Test Student'
      }
    });
    console.log(`Created default login user: ${defaultEmail} (${userId})`);
  } else if (typeof Accounts.setPassword === 'function') {
    Accounts.setPassword(user._id, defaultPassword);
    console.log(`Reset password for existing user: ${defaultEmail}`);
  }
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
