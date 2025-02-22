import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateUniqueId from "generate-unique-id";
import passport from "passport";
import LocalStrategy from "passport-local";
import mongoose from 'mongoose';

// Configure passport
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return done(null, false, { message: 'Invalid credentials' });
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Register a new user
export const register = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // Check if required fields are provided
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Generate username and fullname
    const generatedUsername = `${firstName.split(" ")[0]}${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedFullname = `${firstName}${lastName}${Math.floor(1000 + Math.random() * 9000)}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new User({
      email,
      firstName,
      lastName,
      fullName: generatedFullname,
      username: generatedUsername,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login or create user
export const login = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    // Find user by Firebase UID or create new user
    let user = await User.findOne({ uid });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(displayName, salt);
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        uid,
        email,
        displayName,
        photoURL,
        password: hashedPassword
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // Include the token in the response
      _id: user._id, // Pass the ObjectId here
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }  
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// Get user details
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users with pagination and search
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const currentUserId = req.user.id; // Get current user's ID

    let query = {
      _id: { $ne: currentUserId } // Exclude current user
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -contacts -uid")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch users",
      error: error.message 
    });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { displayName, phoneNumber, profilePic } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        displayName: displayName || user.displayName,
        phoneNumber: phoneNumber || user.phoneNumber,
        // profilePic: profilePic || user.profilePic,
        // fullName: `${firstName || user.firstName} ${lastName || user.lastName}`
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Add contacts controller functions
export const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    user.contacts.push(contactId);
    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('contacts', '-password')
      .select('-password');

    res.status(200).json({
      success: true,
      message: "Contact added successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in addContact:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get contacts 
export const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(userId)
      .populate("contacts", "-password")
      .select("-password");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      contacts: user.contacts || []
    });
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch contacts",
      error: error.message 
    });
  }
};
