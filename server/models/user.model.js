import mongoose from "mongoose";
import plm from "passport-local-mongoose";
const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      default: function () {
        return `user_${Date.now()}`;
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: false,
      trim: true,
      default: function () {
        return `user_${Date.now()}`;
      },
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
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    displayName: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.methods.serializeUser = function () {
  return this.id; // or any unique identifier
};

userSchema.methods.deserializeUser = function (id, callback) {
  this.findById(id, callback);
};

userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

export default User;
