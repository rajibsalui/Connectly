import Call from '../models/call.model.js';
import User from '../models/user.model.js';
import { CALL_STATUS, CALL_TYPES } from '../config/webrtc.config.js';

class VideoCallService {
  constructor() {
    this.activeCalls = new Map();
    this.userCallStatus = new Map(); // Track if user is busy
  }

  // Create a new call
  async createCall(callerId, receiverId, callType = CALL_TYPES.VIDEO) {
    try {
      // Check if users exist
      const [caller, receiver] = await Promise.all([
        User.findById(callerId),
        User.findById(receiverId)
      ]);

      if (!caller || !receiver) {
        throw new Error('User not found');
      }

      // Check if either user is already in a call
      if (this.isUserBusy(callerId) || this.isUserBusy(receiverId)) {
        throw new Error('User is already in a call');
      }

      // Generate unique call ID
      const callId = `${callerId}-${receiverId}-${Date.now()}`;

      // Create call record in database
      const call = new Call({
        callId,
        callerId,
        receiverId,
        callType,
        status: CALL_STATUS.PENDING
      });

      await call.save();

      // Store in active calls
      this.activeCalls.set(callId, {
        callId,
        callerId,
        receiverId,
        callType,
        status: CALL_STATUS.PENDING,
        createdAt: new Date(),
        participants: [callerId, receiverId]
      });

      // Mark users as busy
      this.setUserBusy(callerId, callId);
      this.setUserBusy(receiverId, callId);

      await call.populate([
        { path: 'callerId', select: 'name avatar phoneNumber' },
        { path: 'receiverId', select: 'name avatar phoneNumber' }
      ]);

      return call;
    } catch (error) {
      throw new Error(`Failed to create call: ${error.message}`);
    }
  }

  // Accept a call
  async acceptCall(callId, userId) {
    try {
      const callData = this.activeCalls.get(callId);
      if (!callData || callData.receiverId !== userId) {
        throw new Error('Call not found or unauthorized');
      }

      // Update call status in memory and database
      callData.status = CALL_STATUS.ACCEPTED;
      callData.acceptedAt = new Date();
      this.activeCalls.set(callId, callData);

      await Call.findOneAndUpdate(
        { callId },
        { 
          status: CALL_STATUS.ACCEPTED,
          startTime: new Date()
        }
      );

      return callData;
    } catch (error) {
      throw new Error(`Failed to accept call: ${error.message}`);
    }
  }

  // Reject a call
  async rejectCall(callId, userId) {
    try {
      const callData = this.activeCalls.get(callId);
      if (!callData || callData.receiverId !== userId) {
        throw new Error('Call not found or unauthorized');
      }

      // Update call status
      await Call.findOneAndUpdate(
        { callId },
        { status: CALL_STATUS.REJECTED }
      );

      // Clean up
      this.cleanupCall(callId);

      return { callId, status: CALL_STATUS.REJECTED };
    } catch (error) {
      throw new Error(`Failed to reject call: ${error.message}`);
    }
  }

  // End a call
  async endCall(callId, userId) {
    try {
      const callData = this.activeCalls.get(callId);
      if (!callData || !callData.participants.includes(userId)) {
        throw new Error('Call not found or unauthorized');
      }

      const endTime = new Date();
      let duration = '0:00';

      // Calculate duration if call was accepted
      if (callData.acceptedAt) {
        const durationMs = endTime - callData.acceptedAt;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      // Update call in database
      await Call.findOneAndUpdate(
        { callId },
        { 
          status: CALL_STATUS.ENDED,
          endTime,
          duration
        }
      );

      // Clean up
      this.cleanupCall(callId);

      return { 
        callId, 
        status: CALL_STATUS.ENDED, 
        duration,
        endedBy: userId 
      };
    } catch (error) {
      throw new Error(`Failed to end call: ${error.message}`);
    }
  }

  // Mark call as missed
  async markCallMissed(callId, reason = 'no_answer') {
    try {
      await Call.findOneAndUpdate(
        { callId },
        { 
          status: CALL_STATUS.MISSED,
          missedReason: reason
        }
      );

      this.cleanupCall(callId);

      return { callId, status: CALL_STATUS.MISSED, reason };
    } catch (error) {
      throw new Error(`Failed to mark call as missed: ${error.message}`);
    }
  }

  // Get call information
  getCall(callId) {
    return this.activeCalls.get(callId);
  }

  // Check if user is in a call
  isUserBusy(userId) {
    return this.userCallStatus.has(userId);
  }

  // Set user as busy
  setUserBusy(userId, callId) {
    this.userCallStatus.set(userId, callId);
  }

  // Get user's current call
  getUserCurrentCall(userId) {
    return this.userCallStatus.get(userId);
  }

  // Clean up call data
  cleanupCall(callId) {
    const callData = this.activeCalls.get(callId);
    if (callData) {
      // Remove users from busy status
      callData.participants.forEach(userId => {
        this.userCallStatus.delete(userId);
      });
      
      // Remove call from active calls
      this.activeCalls.delete(callId);
    }
  }

  // Get all active calls
  getActiveCalls() {
    return Array.from(this.activeCalls.values());
  }

  // Clean up calls for disconnected user
  cleanupUserCalls(userId) {
    const userCallId = this.getUserCurrentCall(userId);
    if (userCallId) {
      const callData = this.activeCalls.get(userCallId);
      if (callData) {
        // Mark call as ended due to disconnection
        Call.findOneAndUpdate(
          { callId: userCallId },
          { 
            status: CALL_STATUS.ENDED,
            endTime: new Date(),
            missedReason: 'user_disconnected'
          }
        ).catch(console.error);

        this.cleanupCall(userCallId);
        return { callId: userCallId, otherUsers: callData.participants.filter(id => id !== userId) };
      }
    }
    return null;
  }

  // Update call quality rating
  async updateCallQuality(callId, quality, userId) {
    try {
      const callData = this.activeCalls.get(callId);
      if (!callData || !callData.participants.includes(userId)) {
        throw new Error('Call not found or unauthorized');
      }

      await Call.findOneAndUpdate(
        { callId },
        { quality }
      );

      return { callId, quality };
    } catch (error) {
      throw new Error(`Failed to update call quality: ${error.message}`);
    }
  }

  // Get call statistics
  async getCallStatistics(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await Call.aggregate([
        {
          $match: {
            $or: [{ callerId: userId }, { receiverId: userId }],
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            videoCalls: {
              $sum: { $cond: [{ $eq: ['$callType', 'video'] }, 1, 0] }
            },
            voiceCalls: {
              $sum: { $cond: [{ $eq: ['$callType', 'voice'] }, 1, 0] }
            },
            completedCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] }
            },
            missedCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'missed'] }, 1, 0] }
            },
            averageDuration: { $avg: '$duration' }
          }
        }
      ]);

      return stats[0] || {
        totalCalls: 0,
        videoCalls: 0,
        voiceCalls: 0,
        completedCalls: 0,
        missedCalls: 0,
        averageDuration: 0
      };
    } catch (error) {
      throw new Error(`Failed to get call statistics: ${error.message}`);
    }
  }
}

// Export singleton instance
const videoCallService = new VideoCallService();
export default videoCallService;
