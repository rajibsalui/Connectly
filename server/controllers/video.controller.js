import Call from '../models/call.model.js';
import User from '../models/user.model.js';
import { CALL_STATUS, CALL_TYPES } from '../config/webrtc.config.js';

// Start a new call
export const startCall = async (req, res) => {
    try {
        const { receiverId, callType = 'video' } = req.body;
        const callerId = req.user.id; // Assuming user is authenticated

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ 
                message: 'Receiver not found' 
            });
        }

        // Check if users are already in a call
        const existingCall = await Call.findOne({
            $or: [
                { callerId, status: CALL_STATUS.ONGOING },
                { receiverId: callerId, status: CALL_STATUS.ONGOING },
                { callerId: receiverId, status: CALL_STATUS.ONGOING },
                { receiverId, status: CALL_STATUS.ONGOING }
            ]
        });

        if (existingCall) {
            return res.status(409).json({ 
                message: 'User is already in a call' 
            });
        }

        // Create new call record
        const callId = `${callerId}-${receiverId}-${Date.now()}`;
        const newCall = new Call({ 
            callId, 
            callerId, 
            receiverId, 
            callType,
            status: CALL_STATUS.PENDING
        });
        
        await newCall.save();

        // Populate caller and receiver information
        await newCall.populate([
            { path: 'callerId', select: 'name avatar phoneNumber' },
            { path: 'receiverId', select: 'name avatar phoneNumber' }
        ]);

        res.status(201).json({ 
            message: 'Call initiated successfully', 
            call: newCall
        });
    } catch (error) {
        console.error('Start call error:', error);
        res.status(500).json({ 
            message: 'Failed to start call', 
            error: error.message 
        });
    }
};

// Accept a call
export const acceptCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user.id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({ 
                message: 'Call not found' 
            });
        }

        // Check if user is the receiver
        if (call.receiverId.toString() !== userId) {
            return res.status(403).json({ 
                message: 'Unauthorized to accept this call' 
            });
        }

        // Update call status
        call.status = CALL_STATUS.ACCEPTED;
        await call.save();

        await call.populate([
            { path: 'callerId', select: 'name avatar phoneNumber' },
            { path: 'receiverId', select: 'name avatar phoneNumber' }
        ]);

        res.status(200).json({ 
            message: 'Call accepted', 
            call 
        });
    } catch (error) {
        console.error('Accept call error:', error);
        res.status(500).json({ 
            message: 'Failed to accept call', 
            error: error.message 
        });
    }
};

// Reject a call
export const rejectCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user.id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({ 
                message: 'Call not found' 
            });
        }

        // Check if user is the receiver
        if (call.receiverId.toString() !== userId) {
            return res.status(403).json({ 
                message: 'Unauthorized to reject this call' 
            });
        }

        // Update call status
        call.status = CALL_STATUS.REJECTED;
        await call.save();

        res.status(200).json({ 
            message: 'Call rejected', 
            callId 
        });
    } catch (error) {
        console.error('Reject call error:', error);
        res.status(500).json({ 
            message: 'Failed to reject call', 
            error: error.message 
        });
    }
};

// End a call
export const endCall = async (req, res) => {
    try {
        const { callId } = req.body;
        const userId = req.user.id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({ 
                message: 'Call not found' 
            });
        }

        // Check if user is participant in the call
        const isParticipant = call.callerId.toString() === userId || 
                             call.receiverId.toString() === userId;
        
        if (!isParticipant) {
            return res.status(403).json({ 
                message: 'Unauthorized to end this call' 
            });
        }

        // Calculate duration if call was ongoing
        if (call.status === CALL_STATUS.ONGOING || call.status === CALL_STATUS.ACCEPTED) {
            const endTime = new Date();
            const duration = Math.floor((endTime - call.createdAt) / 1000);
            call.duration = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
        }

        call.status = CALL_STATUS.ENDED;
        await call.save();

        res.status(200).json({ 
            message: 'Call ended', 
            call: {
                callId: call.callId,
                duration: call.duration,
                status: call.status
            }
        });
    } catch (error) {
        console.error('End call error:', error);
        res.status(500).json({ 
            message: 'Failed to end call', 
            error: error.message 
        });
    }
};

// Get active calls for a user
export const getActiveCalls = async (req, res) => {
    try {
        const userId = req.user.id;

        const activeCalls = await Call.find({
            $or: [
                { callerId: userId, status: { $in: [CALL_STATUS.PENDING, CALL_STATUS.ONGOING, CALL_STATUS.ACCEPTED] } },
                { receiverId: userId, status: { $in: [CALL_STATUS.PENDING, CALL_STATUS.ONGOING, CALL_STATUS.ACCEPTED] } }
            ]
        }).populate([
            { path: 'callerId', select: 'name avatar phoneNumber' },
            { path: 'receiverId', select: 'name avatar phoneNumber' }
        ]).sort({ createdAt: -1 });

        res.status(200).json({ 
            activeCalls 
        });
    } catch (error) {
        console.error('Get active calls error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve active calls', 
            error: error.message 
        });
    }
};

// Get call history for a user
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, callType } = req.query;

        const query = {
            $or: [
                { callerId: userId },
                { receiverId: userId }
            ]
        };

        if (callType && [CALL_TYPES.VIDEO, CALL_TYPES.VOICE].includes(callType)) {
            query.callType = callType;
        }

        const calls = await Call.find(query)
            .populate([
                { path: 'callerId', select: 'name avatar phoneNumber' },
                { path: 'receiverId', select: 'name avatar phoneNumber' }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Call.countDocuments(query);

        res.status(200).json({
            calls,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get call history error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve call history', 
            error: error.message 
        });
    }
};

// Update call status (for ongoing calls)
export const updateCallStatus = async (req, res) => {
    try {
        const { callId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({ 
                message: 'Call not found' 
            });
        }

        // Check if user is participant in the call
        const isParticipant = call.callerId.toString() === userId || 
                             call.receiverId.toString() === userId;
        
        if (!isParticipant) {
            return res.status(403).json({ 
                message: 'Unauthorized to update this call' 
            });
        }

        // Validate status
        if (!Object.values(CALL_STATUS).includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid call status' 
            });
        }

        call.status = status;
        await call.save();

        res.status(200).json({ 
            message: 'Call status updated', 
            call: {
                callId: call.callId,
                status: call.status
            }
        });
    } catch (error) {
        console.error('Update call status error:', error);
        res.status(500).json({ 
            message: 'Failed to update call status', 
            error: error.message 
        });
    }
};

// Get call by ID
export const getCallById = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user.id;

        const call = await Call.findOne({ callId })
            .populate([
                { path: 'callerId', select: 'name avatar phoneNumber' },
                { path: 'receiverId', select: 'name avatar phoneNumber' }
            ]);

        if (!call) {
            return res.status(404).json({ 
                message: 'Call not found' 
            });
        }

        // Check if user is participant in the call
        const isParticipant = call.callerId._id.toString() === userId || 
                             call.receiverId._id.toString() === userId;
        
        if (!isParticipant) {
            return res.status(403).json({ 
                message: 'Unauthorized to view this call' 
            });
        }

        res.status(200).json({ call });
    } catch (error) {
        console.error('Get call by ID error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve call', 
            error: error.message 
        });
    }
};

