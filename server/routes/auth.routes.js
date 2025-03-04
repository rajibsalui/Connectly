import express from 'express';
import { register, login, logout, updateProfile, checkAuth, firebaseAuth } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);
router.post('/logout', protect, logout);
router.put('/update-profile', protect, updateProfile);
router.get('/check', protect, checkAuth);

export default router;