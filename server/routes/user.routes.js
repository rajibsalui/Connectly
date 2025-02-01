import express from "express";
import { register, login, getUser, getAllUsers, updateUser, addContact, getContacts } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/all", authMiddleware, getAllUsers); // Changed route path to avoid conflict
router.get("/:id", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);

// Contact routes
router.post("/contacts/add", authMiddleware, addContact);
router.get("/:id/contacts", authMiddleware, getContacts);


export default router; 
