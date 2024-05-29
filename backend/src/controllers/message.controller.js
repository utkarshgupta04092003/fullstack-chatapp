import mongoose from "mongoose";
import { documentCloudinaryFoldername } from "../constant.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";

const addMessage = asyncHandler(async (req, res) => {
    const { message, messageType, receiver } = req.body;
    // check the required fields
    if (!message || !messageType || !receiver) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Please provide all required fields", null)
            );
    }
    // get the sender from the request
    const sender = req.user?._id;
    // create a new message
    const newMessage = await Message.create({
        message,
        messageType,
        sender,
        receiver,
    });
    // check if the message was created successfully
    if (!newMessage) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Message could not be created", null));
    }
    // send the response
    return res
        .status(201)
        .json(new ApiResponse(201, "Message created successfully", newMessage));
});

const addDocument = asyncHandler(async (req, res) => {
    const { messageType, receiver } = req.body;
    const message = req.file;
    // check for the required fields
    if (!req.file || !message || !messageType || !receiver) {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "Please provide all required fields", null)
            );
    }
    // get the sender from user
    const sender = req.user?._id;
    const documentLocalPath = req.file.path;
    // upload data on cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(
        documentLocalPath,
        documentCloudinaryFoldername
    );
    // check for the successfully uploaded
    if (!cloudinaryResponse) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Document could not be uploaded", null));
    }
    // create document on mongodb
    const newMessage = await Message.create({
        message: cloudinaryResponse.secure_url,
        messageType,
        sender,
        receiver,
    });
    // check for successfully document created or not
    if (!newMessage) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Message could not be created", null));
    }
    // send the response
    return res
        .status(201)
        .json(new ApiResponse(201, "Message created successfully", newMessage));
});

const deleteMessage = asyncHandler(async (req, res) => {
    const id = req.body.messageId;
    if (!id) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Invalid Message Details", null));
    }
    // find the message details
    const response = await Message.findById(id);
    if (!response) {
        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    "Something went wrong while deleting message",
                    null
                )
            );
    }
    // check the current login user is owner of this message or not
    if (!req.user?._id.equals(response.sender)) {
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    "Unauthorized User to Delete this message",
                    null
                )
            );
    }
    // if this is not text message, delete this document from cloudinary
    if (response.messageType != "text") {
        deleteFromCloudinary(response.message);
    }
    // delete the message from mongo
    await Message.findByIdAndDelete(id);
    // send the response
    return res
        .status(200)
        .json(new ApiResponse(200, "Message Deleted Successfully", null));
});

const editMessage = asyncHandler(async (req, res) => {
    const id = req.body.messageId;
    if (!id) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Invalid Message Details", null));
    }
    // find the message details
    const response = await Message.findById(id);
    if (!response) {
        return res
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    "Something went wrong while deleting message",
                    null
                )
            );
    }
    // check the current login user is owner of this message or not
    if (!req.user?._id.equals(response.sender)) {
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    "Unauthorized User to Delete this message",
                    null
                )
            );
    }
    // if this is not text message, delete this document from cloudinary
    if (response.messageType != "text") {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "You can not edit document message", null)
            );
    }
    // delete the message from mongo
    const updatedMessage = await Message.findByIdAndUpdate(
        id,
        {
            $set: {
                message: req.body.message,
            },
        },
        { new: true }
    );
    // send the response
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Message Deleted Successfully", updatedMessage)
        );
});
// need to check
const getMessage = asyncHandler(async (req, res) => {
    const { receiver, offset } = req.body;
    if (!receiver) {
        return res
            .status(400)
            .json(new ApiResponse(400, "Invalid Message Details", null));
    }
    const sender = req.user._id;
    // get the last 10 message after skipping offset*limit number of messages
    const messages = await Message.aggregate([
        {
            $match: {
                sender: sender,
                receiver: new mongoose.Types.ObjectId(receiver),
            },
        },
        {
            $sort: {
                sendAt: -1, // Sort by sendAt in descending order to get the latest messages first
            },
        },
        {
            $skip: offset * 10, // Skip the most recent messages
        },
        {
            $limit: 10, // Limit to the last 10 messages
        },
        {
            $sort: {
                sendAt: 1, // Optionally, re-sort by sendAt in ascending order if needed
            },
        },
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, "Message Deleted Successfully", messages));
});

export { addMessage, addDocument, deleteMessage, editMessage, getMessage };
