import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

const Wishlists = new Mongo.Collection('wishlists');
const Reviews = new Mongo.Collection('reviews');

Meteor.startup(() => {
  console.log('Meteor server started');
  console.log('MONGO_URL=', process.env.MONGO_URL || 'mongodb://127.0.0.1:3001/meteor');
});

Meteor.methods({
  async 'customRegister'(username, email, password) {
    check(username, String);
    check(email, String);
    check(password, String);

    if (!username.trim() || !email.trim() || !password.trim()) {
      throw new Meteor.Error('missing-fields', 'Please fill in all fields.');
    }

    const existingUser = await Meteor.users.findOneAsync({
      $or: [
        { 'emails.address': email },
        { username: username },
        { username: email }
      ]
    });

    if (existingUser) {
      throw new Meteor.Error('email-exists', 'This email or username already exists.');
    }

    const userId = await Accounts.createUserAsync({
      username,
      email,
      password,
      profile: {
        displayName: username,
        bio: '',
        phone: ''
      }
    });

    return { success: true, userId };
  },

  async 'updateProfile'(userId, profile) {
    check(userId, String);
    check(profile, Object);

    await Meteor.users.updateAsync(userId, {
      $set: {
        profile: {
          displayName: profile.displayName || '',
          phone: profile.phone || '',
          bio: profile.bio || ''
        }
      }
    });

    return { success: true };
  },

  async 'addWishlist'(userId, product) {
    check(userId, String);
    check(product, Object);

    const existing = await Wishlists.findOneAsync({
      userId,
      'product.id': product.id
    });

    if (existing) {
      throw new Meteor.Error('already-exists', 'This item is already in your wishlist.');
    }

    await Wishlists.insertAsync({
      userId,
      product,
      createdAt: new Date()
    });

    return { success: true };
  },

  async 'getWishlist'(userId) {
    check(userId, String);

    return await Wishlists.find(
      { userId },
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'removeWishlist'(wishlistId) {
    check(wishlistId, String);

    await Wishlists.removeAsync(wishlistId);

    return { success: true };
  },
  async 'addReview'(review) {
  check(review, Object);

  if (!review.sellerEmail || !review.comment) {
    throw new Meteor.Error('missing-fields', 'Please fill in all review fields.');
  }

  await Reviews.insertAsync({
    sellerEmail: review.sellerEmail,
    rating: Number(review.rating),
    comment: review.comment,
    reviewerEmail: review.reviewerEmail,
    createdAt: new Date()
  });

  return { success: true };
  },

async 'getReviews'() {
  return await Reviews.find(
    {},
    { sort: { createdAt: -1 } }
  ).fetchAsync();
  }
});