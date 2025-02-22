import express from "express";
import { register, login, getUser, getAllUsers, updateUser, addContact, getContacts } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/all", authMiddleware, getAllUsers);
router.get("/contacts", authMiddleware, getContacts); // Changed this route
router.get("/:id", authMiddleware, getUser);
router.put("/update", authMiddleware, updateUser);
router.post("/contacts/add", authMiddleware, addContact);

export default router;
