import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.utils.js';
import { uploadImage } from '../utils/uploadImage.js';


// Get all users except current user
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('firstName lastName username avatar isOnline lastSeen email')
      .sort({ isOnline: -1, lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ _id: { $ne: req.user.id } });

    res.status(200).json({
      success: true,
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search users by username or name
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
      .select('firstName lastName username avatar isOnline lastSeen')
      .sort({ isOnline: -1, lastName: 1, firstName: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users"
    });
  }
};

// Get user contacts
export const getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'contacts',
        select: 'firstName lastName username avatar isOnline lastSeen email',
        options: { sort: { isOnline: -1, lastName: 1, firstName: 1 } }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      contacts: user.contacts
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts"
    });
  }
};

// Add contact
export const addContact = async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    // Check if contact exists
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    // Check if already in contacts
    const user = await User.findById(req.user.id);
    if (user.contacts.includes(contactId)) {
      return res.status(400).json({
        success: false,
        message: "Contact already added"
      });
    }

    // Add contact to user's contacts
    user.contacts.push(contactId);
    await user.save();

    // Populate the newly added contact
    const updatedUser = await User.findById(req.user.id)
      .populate({
        path: 'contacts',
        select: 'firstName lastName username avatar isOnline lastSeen'
      });

    res.status(200).json({
      success: true,
      message: "Contact added successfully",
      contacts: updatedUser.contacts
    });
  } catch (error) {
    console.error("Add contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add contact"
    });
  }
};