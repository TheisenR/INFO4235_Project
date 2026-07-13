import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';

const Wishlists = new Mongo.Collection('Wishlists');
const Reviews = new Mongo.Collection('Reviews');
const Listings = new Mongo.Collection('Listings');
const Purchases = new Mongo.Collection('Purchases');

const normalizeListingId = (listingId) => {
  if (typeof listingId === 'string' && listingId.trim()) {
    return listingId;
  }

  if (listingId && typeof listingId === 'object') {
    if (typeof listingId._str === 'string' && listingId._str.trim()) {
      return listingId._str;
    }

    if (typeof listingId.$oid === 'string' && listingId.$oid.trim()) {
      return listingId.$oid;
    }

    if (typeof listingId.toHexString === 'function') {
      const hex = listingId.toHexString();
      if (typeof hex === 'string' && hex.trim()) {
        return hex;
      }
    }
  }

  throw new Meteor.Error('invalid-id', 'Invalid listing id.');
};

const getListingQuery = (rawListingId) => {
  const listingId = normalizeListingId(rawListingId);
  const conditions = [{ _id: listingId }, { id: listingId }];

  if (/^[a-fA-F0-9]{24}$/.test(listingId)) {
    conditions.push({ _id: new Mongo.ObjectID(listingId) });
  }

  return { listingId, query: { $or: conditions } };
};

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

  const userId = this.userId;

  if (!userId) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to create a review.');
  }

  const currentUser = await Meteor.users.findOneAsync(
    { _id: userId },
    { fields: { username: 1, emails: 1 } }
  );

  const reviewerEmail = currentUser?.emails?.[0]?.address || currentUser?.username || review.reviewerEmail || '';

  await Reviews.insertAsync({
    reviewerId: userId,
    sellerEmail: review.sellerEmail,
    rating: Number(review.rating),
    comment: review.comment,
    reviewerEmail,
    createdAt: new Date()
  });

  return { success: true };
  },

  async 'getMyAuthoredReviews'() {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view your reviews.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { username: 1, emails: 1 } }
    );

    const currentEmail = currentUser?.emails?.[0]?.address || '';
    const currentUsername = currentUser?.username || '';
    const selectors = [{ reviewerId: userId }];

    if (currentEmail) {
      selectors.push({ reviewerEmail: currentEmail });
    }

    if (currentUsername) {
      selectors.push({ reviewerEmail: currentUsername });
    }

    return await Reviews.find(
      { $or: selectors },
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'updateReview'(reviewId, reviewInput) {
    check(reviewId, Match.OneOf(String, Object));
    check(reviewInput, Match.ObjectIncluding({
      sellerEmail: String,
      rating: Number,
      comment: String
    }));

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to edit a review.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { username: 1, emails: 1 } }
    );

    const currentEmail = currentUser?.emails?.[0]?.address || '';
    const review = await Reviews.findOneAsync({ _id: reviewId });

    if (!review) {
      throw new Meteor.Error('not-found', 'Review not found.');
    }

    const isOwnerById = review.reviewerId === userId;
    const isOwnerByEmail = Boolean(currentEmail)
      && [review.reviewerEmail].includes(currentEmail);
    const isOwnerByUsername = Boolean(currentUser?.username)
      && [review.reviewerEmail].includes(currentUser.username);

    if (!isOwnerById && !isOwnerByEmail && !isOwnerByUsername) {
      throw new Meteor.Error('not-authorized', 'You can only edit reviews you created.');
    }

    await Reviews.updateAsync(
      { _id: reviewId },
      {
        $set: {
          sellerEmail: reviewInput.sellerEmail.trim(),
          rating: Number(reviewInput.rating),
          comment: reviewInput.comment.trim(),
          updatedAt: new Date()
        }
      }
    );

    return { success: true };
  },

  async 'deleteReview'(reviewId) {
    check(reviewId, Match.OneOf(String, Object));

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete a review.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { username: 1, emails: 1 } }
    );

    const currentEmail = currentUser?.emails?.[0]?.address || '';
    const review = await Reviews.findOneAsync({ _id: reviewId });

    if (!review) {
      throw new Meteor.Error('not-found', 'Review not found.');
    }

    const isOwnerById = review.reviewerId === userId;
    const isOwnerByEmail = Boolean(currentEmail)
      && [review.reviewerEmail].includes(currentEmail);
    const isOwnerByUsername = Boolean(currentUser?.username)
      && [review.reviewerEmail].includes(currentUser.username);

    if (!isOwnerById && !isOwnerByEmail && !isOwnerByUsername) {
      throw new Meteor.Error('not-authorized', 'You can only delete reviews you created.');
    }

    await Reviews.removeAsync({ _id: reviewId });

    return { success: true };
  },

async 'getReviews'() {
  return await Reviews.find(
    {},
    { sort: { createdAt: -1 } }
  ).fetchAsync();
  },

  async 'getMyReviews'() {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view reviews about you.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { username: 1, emails: 1 } }
    );

    const currentEmail = currentUser?.emails?.[0]?.address || '';
    const currentUsername = currentUser?.username || '';
    const selectors = [];

    if (currentEmail) {
      selectors.push({ sellerEmail: currentEmail });
    }

    if (currentUsername) {
      selectors.push({ sellerEmail: currentUsername });
    }

    if (selectors.length === 0) {
      return [];
    }

    return await Reviews.find(
      { $or: selectors },
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'getListings'() {
    return await Listings.find(
      {},
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'getMyListings'() {
    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view your listings.');
    }

    const sellerUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { emails: 1 } }
    );

    const sellerEmail = sellerUser?.emails?.[0]?.address || '';
    const selector = sellerEmail
      ? {
          $or: [
            { sellerId: userId },
            { userId: userId },
            { ownerId: userId },
            { sellerEmail: sellerEmail },
            { email: sellerEmail },
            { contactEmail: sellerEmail }
          ]
        }
      : {
          $or: [
            { sellerId: userId },
            { userId: userId },
            { ownerId: userId }
          ]
        };

    return await Listings.find(
      selector,
      { sort: { createdAt: -1 } }
    ).fetchAsync();
  },

  async 'addListing'(listingInput) {
    check(listingInput, Match.ObjectIncluding({
      title: String,
      category: String,
      price: Number,
      condition: String,
      location: String,
      description: String,
      imageUrl: Match.Optional(String)
    }));

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create a listing.');
    }

    const title = listingInput.title.trim();
    const category = listingInput.category.trim();
    const description = listingInput.description.trim();
    const condition = listingInput.condition.trim();
    const location = listingInput.location.trim();
    const imageUrl = (listingInput.imageUrl || '').trim();
    const price = Number(listingInput.price);

    if (!title || !category || !description) {
      throw new Meteor.Error('missing-fields', 'Title, category, and description are required.');
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Meteor.Error('invalid-price', 'Price must be a valid non-negative number.');
    }

    const sellerUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { username: 1, emails: 1, profile: 1 } }
    );

    const sellerEmail = sellerUser?.emails?.[0]?.address || '';
    const sellerName = sellerUser?.profile?.displayName || sellerUser?.username || sellerEmail;

    const listingId = await Listings.insertAsync({
      title,
      category,
      price,
      condition,
      location,
      description,
      imageUrl,
      sellerId: userId,
      sellerEmail,
      sellerName,
      campus: sellerUser?.profile?.campus || '',
      institution: sellerUser?.profile?.institution || '',
      phone: sellerUser?.profile?.phone || '',
      createdAt: new Date()
    });

    return { success: true, listingId };
  },

  async 'updateListing'(listingId, listingInput) {
    check(listingId, Match.OneOf(String, Object));
    check(listingInput, Match.ObjectIncluding({
      title: String,
      category: String,
      price: Number,
      condition: String,
      location: String,
      description: String,
      imageUrl: Match.Optional(String)
    }));

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to edit a listing.');
    }

    const { query } = getListingQuery(listingId);
    const listing = await Listings.findOneAsync(query);

    if (!listing) {
      throw new Meteor.Error('not-found', 'Listing not found.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { emails: 1 } }
    );

    const currentUserEmail = currentUser?.emails?.[0]?.address || '';
    const isOwnerById = listing.sellerId === userId || listing.userId === userId || listing.ownerId === userId;
    const isOwnerByEmail = Boolean(currentUserEmail)
      && [listing.sellerEmail, listing.email, listing.contactEmail].includes(currentUserEmail);

    if (!isOwnerById && !isOwnerByEmail) {
      throw new Meteor.Error('not-authorized', 'You can only edit your own listings.');
    }

    const title = listingInput.title.trim();
    const category = listingInput.category.trim();
    const description = listingInput.description.trim();
    const condition = listingInput.condition.trim();
    const location = listingInput.location.trim();
    const imageUrl = (listingInput.imageUrl || '').trim();
    const price = Number(listingInput.price);

    if (!title || !category || !description) {
      throw new Meteor.Error('missing-fields', 'Title, category, and description are required.');
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Meteor.Error('invalid-price', 'Price must be a valid non-negative number.');
    }

    await Listings.updateAsync(
      { _id: listing._id },
      {
        $set: {
          title,
          category,
          price,
          condition,
          location,
          description,
          imageUrl,
          updatedAt: new Date()
        }
      }
    );

    return { success: true };
  },

  async 'deleteListing'(listingId) {
    check(listingId, Match.OneOf(String, Object));

    const userId = this.userId;

    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to delete a listing.');
    }

    const { query } = getListingQuery(listingId);
    const listing = await Listings.findOneAsync(query);

    if (!listing) {
      throw new Meteor.Error('not-found', 'Listing not found.');
    }

    const currentUser = await Meteor.users.findOneAsync(
      { _id: userId },
      { fields: { emails: 1 } }
    );

    const currentUserEmail = currentUser?.emails?.[0]?.address || '';
    const isOwnerById = listing.sellerId === userId || listing.userId === userId || listing.ownerId === userId;
    const isOwnerByEmail = Boolean(currentUserEmail)
      && [listing.sellerEmail, listing.email, listing.contactEmail].includes(currentUserEmail);

    if (!isOwnerById && !isOwnerByEmail) {
      throw new Meteor.Error('not-authorized', 'You can only delete your own listings.');
    }

    await Listings.removeAsync({ _id: listing._id });

    return { success: true };
  },

  async 'getListingDetails'(listingId) {
    check(listingId, Match.OneOf(String, Object));

    const { query } = getListingQuery(listingId);

    const listing = await Listings.findOneAsync(query);

    if (!listing) {
      throw new Meteor.Error('not-found', 'Listing not found.');
    }

    const sellerId = listing.sellerId || listing.userId || listing.ownerId;
    const sellerEmail = listing.sellerEmail || listing.email || listing.contactEmail;
    let sellerUser = null;

    if (sellerId) {
      sellerUser = await Meteor.users.findOneAsync(
        { _id: sellerId },
        { fields: { username: 1, emails: 1, profile: 1 } }
      );
    }

    if (!sellerUser && sellerEmail) {
      sellerUser = await Meteor.users.findOneAsync(
        { 'emails.address': sellerEmail },
        { fields: { username: 1, emails: 1, profile: 1 } }
      );
    }

    const seller = sellerUser
      ? {
          userId: sellerUser._id,
          username: sellerUser.username || '',
          email: sellerUser.emails?.[0]?.address || sellerEmail || '',
          displayName: sellerUser.profile?.displayName || '',
          fullName: [sellerUser.profile?.firstName, sellerUser.profile?.lastName].filter(Boolean).join(' ').trim(),
          campus: sellerUser.profile?.campus || '',
          institution: sellerUser.profile?.institution || '',
          phone: sellerUser.profile?.phone || ''
        }
      : {
          email: sellerEmail || '',
          displayName: listing.sellerName || '',
          campus: listing.campus || '',
          institution: listing.institution || '',
          phone: listing.phone || ''
        };

    return { listing, seller };
  },

  async 'buyListing'(listingId) {
    check(listingId, Match.OneOf(String, Object));

    const { listingId: normalizedListingId, query } = getListingQuery(listingId);

    const buyerId = this.userId;

    if (!buyerId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to buy an item.');
    }

    const listing = await Listings.findOneAsync(query);

    if (!listing) {
      throw new Meteor.Error('not-found', 'Listing not found.');
    }

    await Purchases.insertAsync({
      buyerId,
      listingId: normalizedListingId,
      listingSnapshot: listing,
      createdAt: new Date()
    });

    return { success: true, message: 'Purchase request submitted. Contact the seller to complete payment and pickup.' };
  }
});