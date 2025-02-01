import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateUniqueId from "generate-unique-id";
import passport from "passport";
import LocalStrategy from "passport-local";

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

// Login a user
export const login = async (req, res) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: "Server error occurred.",
        error: err.message 
      });
    }

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: info.message || "Invalid credentials" 
      });
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
        onlineStatus: user.onlineStatus
      },
      token
    });
  })(req, res);
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

// Get all users with pagination
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update user details
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, profilePic } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phoneNumber: phoneNumber || user.phoneNumber,
        profilePic: profilePic || user.profilePic,
        fullName: `${firstName || user.firstName} ${lastName || user.lastName}`
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error" });
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

export const getContacts = async (req, res) => {
  try {
    // console.log("req.user:", req.user); 
    // const userId = req.user.id;
    // // const user = await User.findById(req.params.id).select("-password");

    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: "Invalid User ID" });
    // }

    const user = await User.findById(req.params.id)
      .populate("contacts", "-password")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      contacts: user.contacts,
    });
  } catch (error) {
    console.error("Error in getContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};
