import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true, // Making text required
    },
    image: {
      type: String,
      default: "", // Adding a default value for image
    },
    video: { // Adding a video field to support video messages
      type: String,
      default: "", // Adding a default value for video
    },
    status: { // Adding a status field to track message status
      type: String,
      enum: ["sent", "delivered", "read"], // Possible statuses
      default: "sent", // Default status
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;