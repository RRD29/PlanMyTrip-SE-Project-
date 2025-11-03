import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOTP, verifyOtp } from '../services/otp.service.js';
import fs from 'fs';
import path from 'path';

// --- Get Current User's Profile ---
export const getMyProfile = asyncHandler(async (req, res) => {
    // req.user is attached by the verifyJWT middleware
    const user = await User.findById(req.user._id).select("-password -refreshToken +identityVerification +paymentDetails");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

// --- Update Current User's Profile (FIXED LOGIC) ---
export const updateMyProfile = asyncHandler(async (req, res) => {
    // The client sends these fields, which might be undefined for a regular user
    const {
        fullName,
        // Traveller fields
        phoneNumber, gender, dateOfBirth, address, preferredTravelStyle, preferredLanguages, foodPreference, profileBio,
        // Guide fields
        bio, baseLocation, pricePerDay, dob, contactNumber, yearsExperience, languages, expertiseRegions, specialties, availabilitySchedule
    } = req.body;

    // 1. Start with non-role-specific updates
    const updateData = {};
    if (fullName) updateData.fullName = fullName;

    // 2. Handle traveller-specific updates if the user's role is 'user'
    if (req.user.role === 'user') {
        if (phoneNumber !== undefined && phoneNumber !== '') updateData['travellerProfile.phoneNumber'] = phoneNumber;
        if (gender !== undefined && gender !== '') updateData['travellerProfile.gender'] = gender;
        if (dateOfBirth !== undefined && dateOfBirth !== '') updateData['travellerProfile.dateOfBirth'] = new Date(dateOfBirth);
        if (address !== undefined && (address.city || address.state || address.country || address.pincode)) updateData['travellerProfile.address'] = address;
        if (preferredTravelStyle !== undefined) updateData['travellerProfile.preferredTravelStyle'] = Array.isArray(preferredTravelStyle) ? preferredTravelStyle : [];
        if (preferredLanguages !== undefined) updateData['travellerProfile.preferredLanguages'] = Array.isArray(preferredLanguages) ? preferredLanguages : [];
        if (foodPreference !== undefined && foodPreference !== '') updateData['travellerProfile.foodPreference'] = foodPreference;
        if (profileBio !== undefined && profileBio !== '') updateData['travellerProfile.profileBio'] = profileBio;
    }

    // 3. Handle guide-specific updates if the user's role is 'guide'
    if (req.user.role === 'guide') {
        // Set fields that were actually provided as individual paths
        if (bio !== undefined) updateData['guideProfile.bio'] = bio;
        if (baseLocation !== undefined) updateData['guideProfile.baseLocation'] = baseLocation;
        if (pricePerDay !== undefined) updateData['guideProfile.pricePerDay'] = Number(pricePerDay);
        if (dob !== undefined) updateData['guideProfile.dob'] = new Date(dob);
        if (gender !== undefined) updateData['guideProfile.gender'] = gender;
        if (contactNumber !== undefined) updateData['guideProfile.contactNumber'] = contactNumber;
        if (yearsExperience !== undefined) updateData['guideProfile.yearsExperience'] = Number(yearsExperience);
        if (languages !== undefined) updateData['guideProfile.languages'] = Array.isArray(languages) ? languages : languages.split(',').map(s => s.trim()).filter(Boolean);
        if (expertiseRegions !== undefined) updateData['guideProfile.expertiseRegions'] = Array.isArray(expertiseRegions) ? expertiseRegions : expertiseRegions.split(',').map(s => s.trim()).filter(Boolean);
        if (specialties !== undefined) updateData['guideProfile.specialties'] = Array.isArray(specialties) ? specialties : specialties.split(',').map(s => s.trim()).filter(Boolean);
        if (availabilitySchedule !== undefined) updateData['guideProfile.availabilitySchedule'] = availabilitySchedule;
    }

    // If nothing was sent, throw an error
    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No data provided for update.");
    }

    // 4. Find and update the user document
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        // IMPORTANT: { new: true } returns the updated document
        // { runValidators: true } ensures Mongoose runs schema validation
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found after update attempt.");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

// --- Upload Avatar ---
export const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const updateData = { avatar: avatarUrl };

    // If user is a guide, also update the profilePhoto in guideProfile
    if (req.user.role === 'guide') {
        updateData['guideProfile.profilePhoto'] = avatarUrl;
    }
    // If user is a traveller, also update the profilePhoto in travellerProfile
    if (req.user.role === 'user') {
        updateData['travellerProfile.profilePhoto'] = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true }
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar uploaded successfully")
    );
});

// --- Send OTP for Phone Verification ---
export const sendPhoneOTP = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
    }

    // Send OTP using the service
    const otpSent = await sendOTP(phoneNumber);

    if (!otpSent) {
        throw new ApiError(500, "Failed to send OTP");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "OTP sent successfully")
    );
});

// --- Verify Phone OTP ---
export const verifyPhoneOTP = asyncHandler(async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        throw new ApiError(400, "Phone number and OTP are required");
    }

    // Verify OTP
    const isValid = verifyOtp(phoneNumber, otp);
    if (!isValid) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            'guideProfile.contactNumber': phoneNumber,
            'guideProfile.isContactVerified': true
        },
        { new: true }
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Phone number verified successfully")
    );
});

// --- Upload Identity Document ---
export const uploadIdentityDoc = asyncHandler(async (req, res) => {
    const { field } = req.params; // e.g., 'aadhaarCard', 'panCard', etc.

    if (!req.files || !req.files[field] || req.files[field].length === 0) {
        throw new ApiError(400, "No file uploaded");
    }

    const file = req.files[field][0];
    const filePath = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // Update the specific field in identityVerification
    const updateData = {};
    updateData[`identityVerification.${field}`] = filePath;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, `${field} uploaded successfully`)
    );
});

// --- Update Guide Profile with Complete Fields ---
export const updateGuideProfile = asyncHandler(async (req, res) => {
    const {
        fullName,
        dob,
        gender,
        contactNumber,
        baseLocation,
        yearsExperience,
        languages,
        expertiseRegions,
        specialties,
        availabilitySchedule,
        pricePerDay,
        bio,
        // Identity verification fields
        aadhaarNumber,
        panNumber,
        passportNumber,
        drivingLicenseNumber,
        tourismLicenseNumber,
        trainingCertificateNumber,
        policeVerificationNumber,
        // Payment details
        bankAccountName,
        bankAccountNumber,
        bankIFSC,
        upiId
    } = req.body;

    const updateData = {};

    // Update provided fields
    if (fullName !== undefined) updateData.fullName = fullName;
    if (dob !== undefined) updateData['guideProfile.dob'] = new Date(dob);
    if (gender !== undefined) updateData['guideProfile.gender'] = gender;
    if (contactNumber !== undefined) updateData['guideProfile.contactNumber'] = contactNumber;
    if (baseLocation !== undefined) updateData['guideProfile.baseLocation'] = baseLocation;
    if (yearsExperience !== undefined) updateData['guideProfile.yearsExperience'] = Number(yearsExperience);
    if (languages !== undefined) updateData['guideProfile.languages'] = Array.isArray(languages) ? languages : languages.split(',').map(s => s.trim()).filter(Boolean);
    if (expertiseRegions !== undefined) updateData['guideProfile.expertiseRegions'] = Array.isArray(expertiseRegions) ? expertiseRegions : expertiseRegions.split(',').map(s => s.trim()).filter(Boolean);
    if (specialties !== undefined) updateData['guideProfile.specialties'] = Array.isArray(specialties) ? specialties : specialties.split(',').map(s => s.trim()).filter(Boolean);
    if (availabilitySchedule !== undefined) updateData['guideProfile.availabilitySchedule'] = availabilitySchedule;
    if (pricePerDay !== undefined) updateData['guideProfile.pricePerDay'] = Number(pricePerDay);
    if (bio !== undefined) updateData['guideProfile.bio'] = bio;
    if (aadhaarNumber !== undefined) updateData['identityVerification.aadhaarNumber'] = aadhaarNumber;
    if (panNumber !== undefined) updateData['identityVerification.panNumber'] = panNumber;
    if (passportNumber !== undefined) updateData['identityVerification.passportNumber'] = passportNumber;
    if (drivingLicenseNumber !== undefined) updateData['identityVerification.drivingLicenseNumber'] = drivingLicenseNumber;
    if (tourismLicenseNumber !== undefined) updateData['identityVerification.tourismLicenseNumber'] = tourismLicenseNumber;
    if (trainingCertificateNumber !== undefined) updateData['identityVerification.trainingCertificateNumber'] = trainingCertificateNumber;
    if (policeVerificationNumber !== undefined) updateData['identityVerification.policeVerificationNumber'] = policeVerificationNumber;
    if (bankAccountName !== undefined) updateData['paymentDetails.bankAccountName'] = bankAccountName;
    if (bankAccountNumber !== undefined) updateData['paymentDetails.bankAccountNumber'] = bankAccountNumber;
    if (bankIFSC !== undefined) updateData['paymentDetails.bankIFSC'] = bankIFSC;
    if (upiId !== undefined) updateData['paymentDetails.upiId'] = upiId;

    // Check if all required fields are provided to set profile complete
    const requiredProvided = fullName && dob && gender && contactNumber && baseLocation &&
        yearsExperience !== undefined && languages && expertiseRegions && specialties &&
        availabilitySchedule && pricePerDay !== undefined && bio &&
        bankAccountName && bankAccountNumber && bankIFSC;

    if (requiredProvided) {
        updateData.isProfileComplete = true;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No data provided for update.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Guide profile updated successfully")
    );
});
