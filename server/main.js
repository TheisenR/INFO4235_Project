import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

const Wishlists = new Mongo.Collection('Wishlists');
const Reviews = new Mongo.Collection('reviews');
const Listings = new Mongo.Collection('Listings');

Meteor.startup(() => {
  console.log('Meteor server started');
  console.log('MONGO_URL=', process.env.MONGO_URL || 'mongodb://127.0.0.1:3001/meteor');
});

Meteor.methods({
  async 'customRegister'(username, email, password, firstName, lastName, campus, institution) {
    check(username, String);
    check(email, String);
    check(password, String);
    check(firstName, String);
    check(lastName, String);
    check(campus, String);
    check(institution, String);

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !campus.trim() ||
      !institution.trim()
    ) {
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
        firstName,
        lastName,
        campus,
        institution,
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
        'profile.displayName': profile.displayName || '',
        'profile.firstName': profile.firstName || '',
        'profile.lastName': profile.lastName || '',
        'profile.campus': profile.campus || '',
        'profile.institution': profile.institution || '',
        'profile.phone': profile.phone || '',
        'profile.bio': profile.bio || ''
      }
    });

    return { success: true };
  },

  async 'addWishlist'(product) {
    check(product, Object);

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add wishlist items.');
    }

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

  async 'getWishlist'() {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view wishlist items.');
    }

    return await Wishlists.find(
      { userId },
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'removeWishlist'(wishlistId) {
    check(wishlistId, String);

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove wishlist items.');
    }

    const removedCount = await Wishlists.removeAsync({
      _id: wishlistId,
      userId
    });

    if (removedCount === 0) {
      throw new Meteor.Error('not-found', 'Wishlist item not found for this user.');
    }

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
  },

  async 'getListings'() {
    return await Listings.find(
      {},
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  }
});