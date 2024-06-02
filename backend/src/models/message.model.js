import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
    reaction: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullname: {
        type: String,
    }
})
const messageSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        messageType: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sendAt: {
            type: Date,
            default: Date.now,
        },
        isViewed: {
            type: Boolean,
            default: false,
        },
        parentMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        reactions: [
            reactionSchema
        ],
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
