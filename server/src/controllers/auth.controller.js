import { User } from '../models/user.model.js'; 
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';


const generateAccessAndRefreshTokens = async(userId) => {
    const user = await User.findById(userId); 
    if (!user) throw new ApiError(404, "User not found during token generation");

    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const cookieOptions = {  };


export const registerUser = asyncHandler(async (req, res) => {
    
    
    
    const { email, password, fullName, role } = req.body;

    
    if ([email, password, fullName, role].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    
    const user = await User.create({
        email,
        password,
        fullName,
        role  
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }
    

    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse( 201, { user: createdUser, accessToken, refreshToken }, "User registered and logged in successfully" ));
});


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    

    
    const user = await User.findOne({ email });
    if (!user) { throw new ApiError(404, "User not found"); }

    
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) { throw new ApiError(401, "Invalid credentials"); }

    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse( 200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully" ));
});


export const logoutUser = asyncHandler(async (req, res) => {  });


export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        
        return res.status(200).json(new ApiResponse(200, {}, "If an account with that email exists, a password reset link has been sent."));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json(new ApiResponse(200, {}, "Password reset link sent to your email."));
});


export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});
