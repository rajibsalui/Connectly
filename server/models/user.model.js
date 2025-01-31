import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    onlineStatus: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    contacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
   },
   { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;