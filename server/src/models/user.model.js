import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from '../config/index.js';


const identityVerificationSchema = new Schema({
  aadhaarCard: { type: String }, 
  panCard: { type: String },
  passport: { type: String, required: false },
  drivingLicense: { type: String },
  tourismLicense: { type: String, required: false },
  trainingCertificate: { type: String, required: false },
  policeVerification: { type: String },
  governmentIdNumber: { type: String },
  governmentIdProof: { type: String }, 
  aadhaarNumber: { type: String },
  panNumber: { type: String },
  passportNumber: { type: String },
  drivingLicenseNumber: { type: String },
  tourismLicenseNumber: { type: String },
  trainingCertificateNumber: { type: String },
  policeVerificationNumber: { type: String },
}, { _id: false });

const paymentDetailsSchema = new Schema({
  bankAccountName: { type: String },
  bankAccountNumber: { type: String },
  bankIFSC: { type: String },
  upiId: { type: String, required: false },
}, { _id: false });

const guideProfileSchema = new Schema({
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contactNumber: { type: String },
  isContactVerified: { type: Boolean, default: false },
  baseLocation: { type: String },
  yearsExperience: { type: Number },
  languages: [{ type: String }],
  expertiseRegions: [{ type: String }],
  specialties: [{ type: String }],
  availabilitySchedule: { type: String },
  pricePerDay: { type: Number },
  bio: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  profilePhoto: { type: String }, 
}, { _id: false });

const travellerProfileSchema = new Schema({
  phoneNumber: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  address: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
  },
  preferredTravelStyle: [{ type: String, enum: ['Adventure', 'Relaxation', 'Cultural', 'Nature', 'Luxury', 'Budget', 'Solo', 'Family'] }],
  preferredLanguages: [{ type: String }],
  foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan', 'Jain', 'Halal', 'Other'] },
  profileBio: { type: String },
  profilePhoto: { type: String }, 
}, { _id: false });


const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: [true, 'Password is required'] },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'guide', 'admin'], default: 'user' },
    avatar: { type: String, default: 'https://via.placeholder.com/150' },
    guideProfile: { type: guideProfileSchema, default: () => ({}) },
    travellerProfile: { type: travellerProfileSchema, default: () => ({}) },
    identityVerification: { type: identityVerificationSchema, default: () => ({}), select: false },
    paymentDetails: { type: paymentDetailsSchema, default: () => ({}), select: false },
    isProfileComplete: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
  
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, fullName: this.fullName, role: this.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


export const User = mongoose.model('User', userSchema);
