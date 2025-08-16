import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.utils.js";
import videoCallService from "../services/video.service.js";

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join personal room
    socket.join(socket.userId);

    // Update user status
    socket.broadcast.emit("user:online", socket.userId);

    // Handle private messages
    socket.on("message:send", async (data) => {
      const { receiverId, message } = data;
      io.to(receiverId).emit("message:receive", {
        ...message,
        sender: socket.userId,
      });
    });

    // Handle typing status
    socket.on("typing:start", (receiverId) => {
      io.to(receiverId).emit("typing:start", socket.userId);
    });

    socket.on("typing:stop", (receiverId) => {
      io.to(receiverId).emit("typing:stop", socket.userId);
    });

    // Handle message reactions
    socket.on(
      "message:react",
      async ({ messageId, receiverId, reaction, timestamp }) => {
        try {
          // Broadcast to everyone in the chat except the sender
          socket.broadcast.to(receiverId).emit("message:reaction", {
            messageId,
            userId: socket.userId,
            reaction,
            timestamp,
          });
        } catch (error) {
          console.error("Reaction broadcast error:", error);
        }
      }
    );

    // Handle read receipts
    socket.on("message:read", (data) => {
      const { messageId, senderId } = data;
      io.to(senderId).emit("message:seen", {
        messageId,
        userId: socket.userId,
      });
    });

    // Add these handlers to your socket.io setup

    socket.on(
      "reaction:add",
      async ({ messageId, reactionType, userId, receiverId }) => {
        try {
          // Notify the message sender/receiver about the new reaction
          io.to(receiverId).emit("reaction:received", {
            messageId,
            reactionType,
            userId,
          });
        } catch (error) {
          console.error("Error handling reaction:add:", error);
        }
      }
    );

    socket.on(
      "reaction:remove",
      async ({ messageId, reactionType, userId, receiverId }) => {
        try {
          // Notify the message sender/receiver about the removed reaction
          io.to(receiverId).emit("reaction:removed", {
            messageId,
            reactionType,
            userId,
          });
        } catch (error) {
          console.error("Error handling reaction:remove:", error);
        }
      }
    );

    // Handle chat deletion
    socket.on("chat:delete", async (data) => {
      const { chatId } = data;
      try {
        // Notify other user about chat deletion
        io.to(chatId).emit("chat:deleted", {
          chatId,
          deletedBy: socket.userId,
        });
      } catch (error) {
        console.error("Chat deletion notification error:", error);
      }
    });

    // Video Calling Features using Video Service
    // Call initiation
    socket.on("call:initiate", async (data) => {
      const { receiverId, callType = 'video', callerName } = data;
      
      try {
        // Create call using video service
        const call = await videoCallService.createCall(socket.userId, receiverId, callType);

        // Notify the receiver about incoming call
        io.to(receiverId).emit("call:incoming", {
          callId: call.callId,
          callerId: socket.userId,
          callType: call.callType,
          callerName: callerName || call.callerId.name,
          callerAvatar: call.callerId.avatar
        });

        // Send confirmation to caller
        socket.emit("call:initiated", { 
          callId: call.callId,
          receiver: call.receiverId 
        });

      } catch (error) {
        socket.emit("call:error", { 
          message: error.message,
          type: "initiation_failed"
        });
      }
    });

    // Call acceptance
    socket.on("call:accept", async (data) => {
      const { callId } = data;
      
      try {
        const callData = await videoCallService.acceptCall(callId, socket.userId);
        
        // Notify caller that call was accepted
        io.to(callData.callerId).emit("call:accepted", { 
          callId,
          receiverId: socket.userId 
        });
        
        // Confirm acceptance to receiver
        socket.emit("call:ready", { 
          callId,
          status: "accepted" 
        });

      } catch (error) {
        socket.emit("call:error", { 
          message: error.message,
          type: "acceptance_failed"
        });
      }
    });

    // Call rejection
    socket.on("call:reject", async (data) => {
      const { callId } = data;
      
      try {
        const result = await videoCallService.rejectCall(callId, socket.userId);
        const callData = videoCallService.getCall(callId);
        
        if (callData) {
          // Notify caller that call was rejected
          io.to(callData.callerId).emit("call:rejected", { 
            callId,
            rejectedBy: socket.userId 
          });
        }

        // Confirm rejection to receiver
        socket.emit("call:rejected", { callId });

      } catch (error) {
        socket.emit("call:error", { 
          message: error.message,
          type: "rejection_failed"
        });
      }
    });

    // Call ending
    socket.on("call:end", async (data) => {
      const { callId } = data;
      
      try {
        const result = await videoCallService.endCall(callId, socket.userId);
        const callData = videoCallService.getCall(callId);
        
        if (callData) {
          // Notify other participants that call ended
          const otherParticipants = callData.participants.filter(id => id !== socket.userId);
          otherParticipants.forEach(participantId => {
            io.to(participantId).emit("call:ended", { 
              callId,
              duration: result.duration,
              endedBy: socket.userId 
            });
          });
        }
        
        // Confirm to the user who ended the call
        socket.emit("call:ended", { 
          callId,
          duration: result.duration 
        });

      } catch (error) {
        socket.emit("call:error", { 
          message: error.message,
          type: "end_failed"
        });
      }
    });

    // Handle call timeout/missed
    socket.on("call:timeout", async (data) => {
      const { callId } = data;
      
      try {
        const result = await videoCallService.markCallMissed(callId, 'no_answer');
        const callData = videoCallService.getCall(callId);
        
        if (callData) {
          // Notify caller that call was missed
          io.to(callData.callerId).emit("call:missed", { 
            callId,
            reason: 'no_answer'
          });
        }

      } catch (error) {
        console.error("Call timeout error:", error);
      }
    });

    // WebRTC Signaling
    // Handle offer (caller sends offer to receiver)
    socket.on("webrtc:offer", (data) => {
      const { callId, offer, receiverId } = data;
      io.to(receiverId).emit("webrtc:offer", {
        callId,
        offer,
        callerId: socket.userId
      });
    });

    // Handle answer (receiver sends answer to caller)
    socket.on("webrtc:answer", (data) => {
      const { callId, answer, callerId } = data;
      io.to(callerId).emit("webrtc:answer", {
        callId,
        answer,
        receiverId: socket.userId
      });
    });

    // Handle ICE candidates
    socket.on("webrtc:ice-candidate", (data) => {
      const { callId, candidate, targetUserId } = data;
      io.to(targetUserId).emit("webrtc:ice-candidate", {
        callId,
        candidate,
        fromUserId: socket.userId
      });
    });

    // Media control events
    socket.on("call:toggle-video", (data) => {
      const { callId, isVideoEnabled, targetUserId } = data;
      io.to(targetUserId).emit("call:peer-video-toggle", {
        callId,
        isVideoEnabled,
        userId: socket.userId
      });
    });

    socket.on("call:toggle-audio", (data) => {
      const { callId, isAudioEnabled, targetUserId } = data;
      io.to(targetUserId).emit("call:peer-audio-toggle", {
        callId,
        isAudioEnabled,
        userId: socket.userId
      });
    });

    // Handle call status updates
    socket.on("call:status-update", (data) => {
      const { callId, status, targetUserId } = data;
      io.to(targetUserId).emit("call:status-update", {
        callId,
        status,
        userId: socket.userId
      });
    });

    // Handle user going busy
    socket.on("user:busy", (data) => {
      const { callerId } = data;
      io.to(callerId).emit("call:user-busy", {
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
      
      // Clean up any active calls for this user using video service
      const cleanupResult = videoCallService.cleanupUserCalls(socket.userId);
      
      if (cleanupResult) {
        // Notify other participants that user disconnected
        cleanupResult.otherUsers.forEach(userId => {
          io.to(userId).emit("call:ended", {
            callId: cleanupResult.callId,
            reason: "user_disconnected",
            disconnectedUser: socket.userId
          });
        });
      }
      
      socket.broadcast.emit("user:offline", socket.userId);
    });
  });

  return io;
};

export default configureSocket;
