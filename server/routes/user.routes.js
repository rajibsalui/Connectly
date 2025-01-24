import express from "express";
import { register, login, getUser } from "../controllers/user.controller.js";

const router = express.Router();


router.post("/register", register);


router.post("/login", login);


router.get("/:id", getUser);

export default router;
