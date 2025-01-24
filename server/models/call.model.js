import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callType: {
      type: String,
      enum: ["voice", "video"],
      required: true,
    },
    duration: {
      type: String,
      default: "0:00", // Default duration
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["missed", "completed", "ongoing"],
      default: "completed",
    },
  },
  { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;
