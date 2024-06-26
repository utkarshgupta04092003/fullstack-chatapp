import mongoose from "mongoose";
import { documentCloudinaryFoldername } from "../constant.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const addMessage = asyncHandler(async (req, res) => {
    const { message, messageType, receiver, fileName, parentMessage } = req.body;
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
        fileName: fileName || "",
        parentMessage: parentMessage || null,
    });
    // check if the message was created successfully
    if (!newMessage) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Message could not be created", null));
    }
    // populate the parent message
    await newMessage.populate("parentMessage");
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
        deleteFromCloudinary(response.message, response.messageType);
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
            .json(new ApiResponse(500, "Did not found the message", null));
    }
    // check the current login user is owner of this message or not
    if (!req.user?._id.equals(response.sender)) {
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    "Unauthorized User to Edit this message",
                    null
                )
            );
    }
    // if this is not text message, edit this document from cloudinary
    if (response.messageType != "text") {
        return res
            .status(400)
            .json(
                new ApiResponse(400, "You can not edit document message", null)
            );
    }
    // edit the message from mongo
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
            new ApiResponse(200, "Message Updated Successfully", updatedMessage)
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
                $or: [
                    {
                        sender: sender,
                        receiver: new mongoose.Types.ObjectId(receiver),
                    },
                    {
                        sender: new mongoose.Types.ObjectId(receiver),
                        receiver: sender,
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'messages',
                localField: 'parentMessage',
                foreignField: '_id',
                as: 'parentMessage',
            }
        },
        {
            $unwind: {
                path: '$parentMessage',
                preserveNullAndEmptyArrays: true,
            }
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
    const senderDetails = {
        _id: req.user._id,
        fullname: req.user.fullname,
        avatar: req.user.avatar,
    };
    const receiverDetails =
        await User.findById(receiver).select("fullname avatar");
    if (!receiverDetails) {
        return res
            .status(404)
            .json(new ApiResponse(404, "Receiver not found", null));
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, "Message Fetched Successfully", {
                messages,
                senderDetails,
                receiverDetails,
            })
        );
});

// get the user list with whom the current user has chat either in sent or received
// with user details, last message and last message date and sorted by last message date
const getUserList = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const chatUsers = await Message.aggregate([
        {
            $match: {
                $or: [{ sender: userId }, { receiver: userId }],
            },
        },
        {
            $sort: { sendAt: -1 },
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$sender", userId] },
                        "$receiver",
                        "$sender",
                    ],
                },
                lastMessageDate: { $first: "$sendAt" },
                lastMessage: { $first: "$message" },
                messageType: { $first: "$messageType" },
                fileName: { $first: "$fileName" },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "userDetails",
            },
        },
        {
            $unwind: "$userDetails",
        },
        {
            $project: {
                _id: 1,
                "userDetails.fullname": 1,
                "userDetails.email": 1,
                "userDetails.username": 1,
                "userDetails.avatar": 1,
                lastMessage: 1,
                lastMessageDate: 1,
                messageType: 1,
                fileName: 1,
            },
        },
        {
            $sort: { lastMessageDate: -1 },
        },
    ]);
    return res
        .status(200)
        .json(
            new ApiResponse(200, "User List Fetched Successfully", chatUsers)
        );
});

const updateMessageReaction = asyncHandler(async (req, res) => {
    const { messageId, user, reaction } = req.body;
    const message = await Message.findById(messageId);
    if (!message) {
        return res
            .status(500)
            .json(new ApiResponse(500, "Can not get the message", null));
    }
    if (message.sender != user && message.receiver != user) {
        return res
            .status(401)
            .json(
                new ApiResponse(
                    401,
                    "This user can not react to this message",
                    null
                )
            );
    }
    const filtered = message.reactions.filter((r)=>(r.user == user && r.reaction==reaction));
    // if already exist, then remove the reaction and return the response
    if(filtered.length !== 0){
        const filteredAfterDelete = message.reactions.filter((r)=>(!(r.user == user && r.reaction==reaction)))
        message.reactions = filteredAfterDelete;
        await message.save();
        return res.status(200).json(new ApiResponse(200,"deleted", message));
    }
    message.reactions.push({ reaction, user, fullname: req.user.fullname });
    await message.save();
    return res
        .status(200)
        .json(new ApiResponse(200, "added", message));
});

export {
    addMessage,
    addDocument,
    deleteMessage,
    editMessage,
    getMessage,
    getUserList,
    updateMessageReaction,
};
