import User from "../models/user.model.js"; // Import the User model
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation



// Register a new user
export const register = async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    //using gensalt to generate a salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      email: email,
      fullName: fullName,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Generate a token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Login a user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET );
    res.cookie('authToken', token, {
      httpOnly: true,  // Prevents client-side JavaScript from accessing the cookie
      secure: true,    // Ensures cookie is only sent over HTTPS
      sameSite: 'strict', // Protects against CSRF attacks
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// Get user details
export const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(id).select("-password"); // Exclude password from response
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};
