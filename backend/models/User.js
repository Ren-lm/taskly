// backend/models/Users.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for a User
const UserSchema = new mongoose.Schema({
  name: {
    type: String,       // The user's name this is required
    required: true,
  },
  email: {
    type: String,       // The user's email this is required and should be  unique
    required: true,
    unique: true,
  },
  password: {
    type: String,       // user password
    required: true,
  },
  googleId: {
    type: String,       //  use  Google ID
    default: null,
  },
});

// Middleware to hash the user's password before saving to the database
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Continue to the next middleware or save operation
  next();
});

// Method to compare a given password with the hashed password in the database
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
