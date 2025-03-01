// import express from "express";
// import { register, login, getUser, getAllUsers, updateUser, addContact, getContacts } from "../controllers/user.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";

// const router = express.Router();

// // Public routes
// router.post("/register", register);
// router.post("/login", login);

// // Protected routes
// router.get("/all", authMiddleware, getAllUsers);
// router.get("/contacts", authMiddleware, getContacts); // Changed this route
// router.get("/:id", authMiddleware, getUser);
// router.put("/update", authMiddleware, updateUser);
// router.post("/contacts/add", authMiddleware, addContact);

// export default router;

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getAllUsers, searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

// Get all users except current user
router.get('/all', protect, getAllUsers);

// Search users by username or name
router.get('/search', protect, searchUsers);

export default router;
