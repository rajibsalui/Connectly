import mongoose from "mongoose";
import plm from 'passport-local-mongoose'
const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
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

userSchema.methods.serializeUser = function () {
  return this.id; // or any unique identifier
};

userSchema.methods.deserializeUser = function (id, callback) {
  this.findById(id, callback);
};

userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

export default User;