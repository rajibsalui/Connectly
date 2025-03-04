import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
  getAllUsers, 
  searchUsers,
  getContacts,
  addContact 
} from '../controllers/user.controller.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User routes
router.get('/all', getAllUsers);
router.get('/search', searchUsers);
router.get('/contacts', getContacts);
router.post('/contacts/add', addContact);

export default router;
