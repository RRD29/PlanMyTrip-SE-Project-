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

// --- THIS IS THE CONSOLIDATED UPDATE FUNCTION ---
export const updateMyProfile = asyncHandler(async (req, res) => {
    // 1. Get ALL text fields from req.body
    const {
        fullName,
        // Traveller fields
        phoneNumber, gender, dateOfBirth, address, preferredTravelStyle, preferredLanguages, foodPreference, profileBio,
        // Guide fields
        bio, baseLocation, pricePerDay, dob, contactNumber, yearsExperience, languages, expertiseRegions, specialties, availabilitySchedule,
        // Guide Private fields
        aadhaarNumber, panNumber, passportNumber, drivingLicenseNumber, tourismLicenseNumber, trainingCertificateNumber, policeVerificationNumber,
        bankAccountName, bankAccountNumber, bankIFSC, upiId
    } = req.body;

    // 2. Start building the update object
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;

    // 3. Handle Traveller Profile (if user) --- NOW USES DOT NOTATION ---
    if (req.user.role === 'user') {
        if (phoneNumber !== undefined) updateData['travellerProfile.phoneNumber'] = phoneNumber;
        if (gender !== undefined && gender !== '') updateData['travellerProfile.gender'] = gender;
        if (dateOfBirth !== undefined && dateOfBirth !== '') {
            const date = new Date(dateOfBirth);
            if (!isNaN(date.getTime())) updateData['travellerProfile.dateOfBirth'] = date;
        }
        if (address !== undefined) {
             // Handle address object fields individually
            if(address.city && address.city !== '') updateData['travellerProfile.address.city'] = address.city;
            if(address.state && address.state !== '') updateData['travellerProfile.address.state'] = address.state;
            if(address.country && address.country !== '') updateData['travellerProfile.address.country'] = address.country;
            if(address.pincode && address.pincode !== '') updateData['travellerProfile.address.pincode'] = address.pincode;
        }
        if (preferredTravelStyle !== undefined) updateData['travellerProfile.preferredTravelStyle'] = Array.isArray(preferredTravelStyle) ? preferredTravelStyle : preferredTravelStyle.split(',').map(s => s.trim()).filter(Boolean);
        if (preferredLanguages !== undefined) updateData['travellerProfile.preferredLanguages'] = Array.isArray(preferredLanguages) ? preferredLanguages : preferredLanguages.split(',').map(s => s.trim()).filter(Boolean);
        if (foodPreference !== undefined && foodPreference !== '') updateData['travellerProfile.foodPreference'] = foodPreference;
        if (profileBio !== undefined) updateData['travellerProfile.profileBio'] = profileBio;
    }

    // 4. Handle Guide Profile (if guide)
    if (req.user.role === 'guide') {
        // We use dot notation for ALL nested fields
        
        // Public Profile
        if (bio !== undefined) updateData['guideProfile.bio'] = bio;
        if (baseLocation !== undefined) updateData['guideProfile.baseLocation'] = baseLocation;
        if (pricePerDay !== undefined) updateData['guideProfile.pricePerDay'] = Number(pricePerDay);
        if (dob !== undefined) updateData['guideProfile.dob'] = dob ? new Date(dob) : null;
        if (gender !== undefined) updateData['guideProfile.gender'] = gender;
        if (contactNumber !== undefined) updateData['guideProfile.contactNumber'] = contactNumber;
        if (yearsExperience !== undefined) updateData['guideProfile.yearsExperience'] = Number(yearsExperience);
        if (languages !== undefined) updateData['guideProfile.languages'] = Array.isArray(languages) ? languages : languages.split(',').map(s => s.trim()).filter(Boolean);
        if (expertiseRegions !== undefined) updateData['guideProfile.expertiseRegions'] = Array.isArray(expertiseRegions) ? expertiseRegions : expertiseRegions.split(',').map(s => s.trim()).filter(Boolean);
        if (specialties !== undefined) updateData['guideProfile.specialties'] = Array.isArray(specialties) ? specialties : specialties.split(',').map(s => s.trim()).filter(Boolean);
        if (availabilitySchedule !== undefined) updateData['guideProfile.availabilitySchedule'] = availabilitySchedule;
        
        // Private Identity
        if (aadhaarNumber !== undefined) updateData['identityVerification.aadhaarNumber'] = aadhaarNumber;
        if (panNumber !== undefined) updateData['identityVerification.panNumber'] = panNumber;
        if (passportNumber !== undefined) updateData['identityVerification.passportNumber'] = passportNumber;
        if (drivingLicenseNumber !== undefined) updateData['identityVerification.drivingLicenseNumber'] = drivingLicenseNumber;
        if (tourismLicenseNumber !== undefined) updateData['identityVerification.tourismLicenseNumber'] = tourismLicenseNumber;
        if (trainingCertificateNumber !== undefined) updateData['identityVerification.trainingCertificateNumber'] = trainingCertificateNumber;
        if (policeVerificationNumber !== undefined) updateData['identityVerification.policeVerificationNumber'] = policeVerificationNumber;

        // Private Payment
        if (bankAccountName !== undefined) updateData['paymentDetails.bankAccountName'] = bankAccountName;
        if (bankAccountNumber !== undefined) updateData['paymentDetails.bankAccountNumber'] = bankAccountNumber;
        if (bankIFSC !== undefined) updateData['paymentDetails.bankIFSC'] = bankIFSC;
        if (upiId !== undefined) updateData['paymentDetails.upiId'] = upiId;
    }

    // 5. Handle File Uploads (if they exist)
    if (req.files) {
        const getFilePath = (fieldName) => {
            if (req.files[fieldName] && req.files[fieldName][0]) {
                // --- FIX: Create a full, absolute URL ---
                return `${req.protocol}://${req.get('host')}/uploads/${req.files[fieldName][0].filename}`;
            }
            return undefined;
        };

        const avatarUrl = getFilePath('avatar');
        if (avatarUrl) {
            updateData.avatar = avatarUrl;
            if (req.user.role === 'guide') updateData['guideProfile.profilePhoto'] = avatarUrl;
            if (req.user.role === 'user') updateData['travellerProfile.profilePhoto'] = avatarUrl;
        }
        
        // Identity documents (Guide only)
        if (req.user.role === 'guide') {
            const docFields = ['aadhaarCard', 'panCard', 'passport', 'drivingLicense', 'tourismLicense', 'trainingCertificate', 'policeVerification', 'governmentIdProof'];
            docFields.forEach(field => {
                const filePath = getFilePath(field);
                if (filePath) {
                    updateData[`identityVerification.${field}`] = filePath;
                }
            });
        }
    }

    // Check if all required fields are provided to set profile complete (Guide)
    if (req.user.role === 'guide') {
        const userForCheck = await User.findById(req.user._id).select("guideProfile");
        // Create a representation of the *next* state of the profile
        const potentialProfile = { ...userForCheck.guideProfile.toObject() };
        // Apply updates from updateData
        Object.keys(updateData).forEach(key => {
            if (key.startsWith('guideProfile.')) {
                potentialProfile[key.replace('guideProfile.', '')] = updateData[key];
            }
        });

        // Check against the potentially updated profile
        if (potentialProfile.bio && potentialProfile.baseLocation && potentialProfile.pricePerDay && potentialProfile.contactNumber && potentialProfile.yearsExperience) {
            updateData.isProfileComplete = true;
        }
    }

    // 6. Check if any data was actually sent
    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No data provided for update.");
    }

    // 7. Find and update the user document
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true, omitUndefined: true } // omitUndefined prevents wiping fields
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found after update attempt.");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Profile updated successfully")
    );
});

// --- Send OTP for Phone Verification (No Change) ---
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

// --- Verify Phone OTP (No Change) ---
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
    
    // Determine which profile to update
    const phoneUpdate = {};
    if (req.user.role === 'guide') {
        phoneUpdate['guideProfile.contactNumber'] = phoneNumber;
        phoneUpdate['guideProfile.isContactVerified'] = true;
    } else { // 'user'
        phoneUpdate['travellerProfile.phoneNumber'] = phoneNumber;
        phoneUpdate['travellerProfile.isContactVerified'] = true;
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: phoneUpdate },
        { new: true }
    ).select("-password -refreshToken +identityVerification +paymentDetails");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Phone number verified successfully")
    );
});

// --- THESE FUNCTIONS ARE NO LONGER CALLED BY ROUTES ---
// The logic from them has been merged into updateMyProfile.

/*
export const uploadAvatar = asyncHandler(async (req, res) => {
    // ... This logic is now inside updateMyProfile ...
});

export const uploadIdentityDoc = asyncHandler(async (req, res) => {
    // ... This logic is now inside updateMyProfile ...
});

export const updateGuideProfile = asyncHandler(async (req, res) => {
    // ... This logic is now inside updateMyProfile ...
});
*/