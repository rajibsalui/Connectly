// WebRTC Configuration
export const webrtcConfig = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'stun:stun1.l.google.com:19302'
    },
    // You can add TURN servers for better connectivity
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'your-username',
    //   credential: 'your-password'
    // }
  ]
};

// Media constraints for video calls
export const mediaConstraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 16, ideal: 30, max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

// Media constraints for voice calls
export const voiceConstraints = {
  video: false,
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

// Call types
export const CALL_TYPES = {
  VIDEO: 'video',
  VOICE: 'voice'
};

// Call status
export const CALL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ENDED: 'ended',
  MISSED: 'missed',
  ONGOING: 'ongoing'
};

// Socket events for video calling
export const SOCKET_EVENTS = {
  // Call initiation
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_END: 'call:end',
  CALL_MISSED: 'call:missed',
  
  // WebRTC signaling
  OFFER: 'webrtc:offer',
  ANSWER: 'webrtc:answer',
  ICE_CANDIDATE: 'webrtc:ice-candidate',
  
  // Call status updates
  CALL_STATUS_UPDATE: 'call:status-update',
  
  // Media controls
  TOGGLE_VIDEO: 'call:toggle-video',
  TOGGLE_AUDIO: 'call:toggle-audio',
  
  // Error handling
  CALL_ERROR: 'call:error'
};

export default {
  webrtcConfig,
  mediaConstraints,
  voiceConstraints,
  CALL_TYPES,
  CALL_STATUS,
  SOCKET_EVENTS
};