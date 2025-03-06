import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      // required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    phoneNumber: {
      type: String,
      default: "",
      sparse: true
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "facebook"],
      default: "email",
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    displayName: {
      type: String,
      // required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      sparse: true
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
