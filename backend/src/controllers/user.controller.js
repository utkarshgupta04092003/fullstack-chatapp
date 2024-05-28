import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ValidateEmail } from "../utils/ValidateEmail.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
    coverImageCloudinaryFoldername,
    profileImageCloudinaryFoldername,
} from "../constant.js";
import { removeFiles } from "../utils/removeFiles.js";
import jwt from "jsonwebtoken";

// generate access token and refresh token
const generateAccesstokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccesstoken();
        const refreshToken = await user.generateRefreshtoken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something went wrong");
    }
};
const registerUser = asyncHandler(async (req, res) => {
    // take user input from frontend
    const { username, email, fullname, password } = req.body;
    // check for the file
    console.log("req files", req.files?.avatar[0]);
    const avatarImageLocalPath = req.files?.avatar[0].path;
    let coverImageLocalPath = "";
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    )
        coverImageLocalPath = req.files.coverImage[0].path;
    // empty validation
    if (
        [username, email, fullname, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // validate email format
    if (!ValidateEmail(email)) {
        removeFiles(avatarImageLocalPath);
        removeFiles(coverImageLocalPath);
        throw new ApiError(400, "Invalid email format");
    }
    // check for the user is already exist or not
    const existUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existUser) {
        removeFiles(avatarImageLocalPath);
        removeFiles(coverImageLocalPath);
        throw new ApiError(409, "User with email or username already exist");
    }
    // upload the file to cloudinary
    const cloudinaryAvatarResponse = await uploadOnCloudinary(
        avatarImageLocalPath,
        profileImageCloudinaryFoldername
    );
    let cloudinaryCoverImageResponse = "";
    if (coverImageLocalPath)
        cloudinaryCoverImageResponse = await uploadOnCloudinary(
            coverImageLocalPath,
            coverImageCloudinaryFoldername
        );
    // create new user
    const createdUser = await User.create({
        username,
        fullname,
        email,
        password,
        avatar: cloudinaryAvatarResponse.url,
        coverImage: cloudinaryCoverImageResponse?.url || "",
    });
    // fetch the user details
    const registeredUser = await User.findById(createdUser?._id).select(
        "-password -refreshToken"
    );
    if (!registeredUser) {
        throw new ApiError(500, "something went wrong");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(200, "User Registered Successfully", registeredUser)
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // fetch data from req body
    const { username, email, password } = req.body;
    console.log("username", username, email, password);
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }
    // find the user in the db
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    // check user exists or not
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    const verifyPassword = await user.isPasswordCorrect(password);
    if (!verifyPassword) {
        throw new ApiError(401, "Invalid user credentials");
    }
    // create access toekna nd refresh toekn
    const { accessToken, refreshToken } =
        await generateAccesstokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");
    // setup cookies
    const option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(201, "User Logged In Successful", loggedInUser));
});

const logout = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(500, "Invalid Access Token");
    }
    // remove refesh token from db
    await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );
    // setup cookie options
    const option = {
        httpOnly: true,
        secure: true,
    };
    // clear cookies from the request
    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, "Logout successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // TODOS:

    // fetch refreshtoken from request body or cookies
    const incomingRefreshToken =
        req.body.refreshToken || req.cookies.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
    // validate refreshtoken using jwt
    const decoded = await jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    if (!decoded) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
    // get the user details from db
    const user = await User.findById(decoded._id);
    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
    // verify refresh token with user refresh token
    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh Token is expired or Invalid");
    }
    // generate new tokens
    const { accessToken, refreshToken } =
        await generateAccesstokenAndRefreshToken(user._id);
    const option = {
        httpOnly: true,
        secure: true,
    };
    // send new access token in cookie
    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(200, "Access code Refreshed", { accessToken }));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "Invalid Access Token");
    }
    const { password, newPassword } = req.body;
    // search the user by userid
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(204, "No user found");
    }
    // verify the current password to stored password
    const verifyPassword = await user.isPasswordCorrect(password);
    if (!verifyPassword) {
        throw new ApiError(401, "Invalid user credentials");
    }
    // update the password (it will be hashed by plugin save)
    user.password = newPassword;
    // save the user details to the db
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "Password Changed.", user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(404, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email,
            },
        },
        {
            new: true,
        }
    ).select("-password");
    return res
        .status(200)
        .json(new ApiResponse(200, "Updated Account Details", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarImageLocalPath = req.file?.path;
    // find the avatar image local path
    if (!avatarImageLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    // upload to cloudinary
    const avatarResponse = await uploadOnCloudinary(
        avatarImageLocalPath,
        profileImageCloudinaryFoldername
    );
    if (!avatarResponse) {
        throw new ApiError(500, "Something went wrong in cloudinary");
    }
    const userId = req.user?._id;
    // store the previous cloudinary avatar url for delete later
    const cloudinaryProfileUrl = await User.findById(userId).select("avatar");
    if (!cloudinaryProfileUrl) {
        throw new ApiError(500, "Cannot get user's previous avatar Url");
    }
    // update the avatar url
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                avatar: avatarResponse.url,
            },
        },
        { new: true }
    ).select("-password");
    if (!user) {
        throw new ApiError(500, "Something went wrong while updating avatar");
    }
    // delete the already uploaded profile image from cloudinary
    deleteFromCloudinary(cloudinaryProfileUrl.avatar);
    return res.status(200).json(new ApiResponse(200, "Avatar Updated", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing");
    }
    // upload the cover image to cloudinary
    const coverImageResponse = await uploadOnCloudinary(
        coverImageLocalPath,
        coverImageCloudinaryFoldername
    );
    if (!coverImageResponse) {
        throw new ApiError(500, "Something went wrong in cloudinary");
    }
    const userId = req.user?._id;
    // get the previously stored cover image url
    const cloudinaryCoverUrl = await User.findById(userId).select("coverImage");
    console.log("cloudinary cover image: ", cloudinaryCoverUrl);
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                coverImage: coverImageResponse.url,
            },
        },
        { new: true }
    ).select("-password");
    if (!user) {
        throw new ApiError(
            500,
            "Something went wrong while updating cover image"
        );
    }
    // delete the already uploaded cover image from cloudinary if it is available
    if (cloudinaryCoverUrl.coverImage)
        deleteFromCloudinary(cloudinaryCoverUrl.coverImage);
    return res
        .status(200)
        .json(new ApiResponse(200, "Cover Image Updated", user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "User fetched Successfully", req.user));
});

export {
    registerUser,
    loginUser,
    logout,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getCurrentUser,
};

// remaining route for update avatar and cover Image
