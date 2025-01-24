import express from "express";
import { createChat, deleteChat, getUserChats } from "../controllers/chat.controller.js";

const router = express.Router();

// Route to create a new chat
router.post("/", createChat);

// Route to delete a chat
router.delete("/:chatId", deleteChat);

// Route to get all chats for a user
router.get("/user/:userId", getUserChats);

export default router;
