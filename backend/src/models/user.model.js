import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            requierd: [true, "username is required"],
            lowercase: true,
            trim: true,
            index: true,
            unique: true,
        },
        email: {
            type: String,
            requierd: [true, "email is required"],
            lowercase: true,
            trim: true,
            unique: true,
        },
        fullname: {
            type: String,
            requierd: [true, "fullname is required"],
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary image url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary image url
        },
        password: {
            type: String,
            requierd: [true, "Password is required"],
        },
        accessToken: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);
// pre middleware to hashed the password before saving the password when it changes
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// check whether the password is correct or not, return true/false
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// generate access token
userSchema.methods.generateAccesstoken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};
// generate access token
userSchema.methods.generateRefreshtoken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};
export const User = mongoose.model("User", userSchema);
