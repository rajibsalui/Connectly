import express from 'express';
import { 
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    getActiveCalls,
    getCallHistory,
    updateCallStatus,
    getCallById
} from '../controllers/video.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Call management routes
router.post('/call/start', startCall);
router.post('/call/accept', acceptCall);
router.post('/call/reject', rejectCall);
router.post('/call/end', endCall);

// Call information routes
router.get('/call/active', getActiveCalls);
router.get('/call/history', getCallHistory);
router.get('/call/:callId', getCallById);

// Call status update
router.patch('/call/:callId/status', updateCallStatus);

export default router;