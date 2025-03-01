import User from '../models/user.model.js';

// Get all users except current user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('firstName lastName username avatar isOnline lastSeen')
      .sort({ isOnline: -1, lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search users by username or name
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } }
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};