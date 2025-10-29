import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // <-- Required for password reset token
import config from '../config/index.js';

const guideProfileSchema = new Schema({
  location: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxLength: 1000,
  },
  pricePerDay: {
    type: Number,
    default: 0,
  },
  availability: {
    type: [String], // Array of date strings (e.g., "YYYY-MM-DD")
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
});

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String, // URL to a cloud-hosted image
      default: 'https://via.placeholder.com/150', // Placeholder
    },
    
    // Embedded schema for guide-specific details
    guideProfile: {
      type: guideProfileSchema,
      required: function() { return this.role === 'guide'; },
      default: () => ({}),
    },

    refreshToken: {
      type: String,
    },
    // --- Added fields for Password Reset ---
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    // -------------------------------------
  },
  { timestamps: true }
);

// --- Middleware to hash password before saving ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// --- Method to check password on login ---
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// --- Method to generate a short-lived access token ---
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRY,
    }
  );
};

// --- Method to generate a long-lived refresh token ---
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.JWT_SECRET, 
    {
      expiresIn: '7d',
    }
  );
};

// --- Method to generate a Password Reset Token ---
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before saving to DB for security
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiry time (e.g., 10 minutes from now)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; 

    return resetToken; // Return the *unhashed* token to send via email
};


export const User = mongoose.model('User', userSchema);
