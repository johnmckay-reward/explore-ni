const sequelize = require('../config/database');
const User = require('./User');
const Experience = require('./Experience');
const Booking = require('./Booking');
const Availability = require('./Availability');
const Voucher = require('./Voucher');
const Review = require('./Review');
const Category = require('./Category');

// Define associations

// User and Experience (Vendor relationship)
User.hasMany(Experience, {
  foreignKey: 'vendorId',
  as: 'experiences',
});
Experience.belongsTo(User, {
  foreignKey: 'vendorId',
  as: 'vendor',
});

// User and Booking (Customer relationship)
User.hasMany(Booking, {
  foreignKey: 'customerId',
  as: 'bookings',
});
Booking.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

// Experience and Booking
Experience.hasMany(Booking, {
  foreignKey: 'experienceId',
  as: 'bookings',
});
Booking.belongsTo(Experience, {
  foreignKey: 'experienceId',
  as: 'experience',
});

// Experience and Availability
Experience.hasMany(Availability, {
  foreignKey: 'experienceId',
  as: 'availabilities',
});
Availability.belongsTo(Experience, {
  foreignKey: 'experienceId',
  as: 'experience',
});

// Booking and Availability
Booking.belongsTo(Availability, {
  foreignKey: 'availabilityId',
  as: 'availability',
});
Availability.hasMany(Booking, {
  foreignKey: 'availabilityId',
  as: 'bookings',
});

// Experience and Voucher (for gifted experiences)
Experience.hasMany(Voucher, {
  foreignKey: 'experienceId',
  as: 'vouchers',
});
Voucher.belongsTo(Experience, {
  foreignKey: 'experienceId',
  as: 'experience',
});

// User and Review (Customer relationship)
User.hasMany(Review, {
  foreignKey: 'customerId',
  as: 'reviews',
});
Review.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
});

// Experience and Review
Experience.hasMany(Review, {
  foreignKey: 'experienceId',
  as: 'reviews',
});
Review.belongsTo(Experience, {
  foreignKey: 'experienceId',
  as: 'experience',
});

// Category and Experience (Many-to-Many)
Category.belongsToMany(Experience, {
  through: 'ExperienceCategories',
  foreignKey: 'categoryId',
  as: 'experiences',
});
Experience.belongsToMany(Category, {
  through: 'ExperienceCategories',
  foreignKey: 'experienceId',
  as: 'categories',
});

module.exports = {
  sequelize,
  User,
  Experience,
  Booking,
  Availability,
  Voucher,
  Review,
  Category,
};
