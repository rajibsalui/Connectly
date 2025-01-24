'use client'
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from 'next/navigation';
import CallEnd from './Call_End'; // Import the CallEnd component

// Define signaling server URL
const SOCKET_SERVER_URL = "http://localhost:3000";

const VideoCall: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);
  const router = useRouter();

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    // Connect to the signaling server
    socketRef.current = io(SOCKET_SERVER_URL);

    // Handle incoming offer
    socketRef.current.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) setupPeerConnection();
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    });

    // Handle incoming answer
    socketRef.current.on("answer", async (answer: RTCSessionDescriptionInit) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle incoming ICE candidates
    socketRef.current.on("ice-candidate", (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream to peer connection
    localStream?.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", event.candidate);
      }
    };
  };

  const startCall = async () => {
    if (!peerConnectionRef.current) setupPeerConnection();

    const offer = await peerConnectionRef.current!.createOffer();
    await peerConnectionRef.current!.setLocalDescription(offer);

    socketRef.current.emit("offer", offer);
    setIsCallActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsVideoEnabled(false);
    localStream?.getTracks().forEach(track => track.stop());
    // Instead of redirecting, show the CallEnd component
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoEnabled, audio: isAudioEnabled });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  };

  useEffect(() => {
    startCall();
    startLocalStream();
  }, []);

  if (!isCallActive) {
    return <CallEnd />; // Show CallEnd component when the call is not active
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen p-4 bg-black">
      <div className="flex-1 flex justify-center items-center">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 rounded-lg border-2 border-white"></video>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 ml-7 rounded-lg border-2 border-white"></video>
      </div>
      <div className="flex justify-between w-full mt-4">
        {/* <button onClick={startCall} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200">
          Start Call
        </button> */}
        <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200">
          End Call
        </button>
        <button onClick={toggleVideo} className={`px-4 py-2 ${isVideoEnabled ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-lg hover:bg-blue-600 transition duration-200`}>
          {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        </button>
        <button onClick={toggleAudio} className={`px-4 py-2 ${isAudioEnabled ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-lg hover:bg-blue-600 transition duration-200`}>
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
