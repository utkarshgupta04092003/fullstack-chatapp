import mongoose from "mongoose";
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
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
