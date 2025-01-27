'use client'
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from 'next/navigation';
import CallEnd from './Call_End'; // Import the CallEnd component
import { FcEndCall } from "react-icons/fc";
import { LuVideo, LuVideoOff } from "react-icons/lu";
import { IoVideocamOutline } from "react-icons/io5";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { PiMicrophone } from "react-icons/pi";

// Define signaling server URL
const SOCKET_SERVER_URL = "http://localhost:3000";

const VideoCall: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isSwitched, setIsSwitched] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0); // State to track call duration
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // State to store interval ID

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
    
    // Start the call duration timer
    const id = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsVideoEnabled(false);
    localStream?.getTracks().forEach(track => track.stop());
    
    // Clear the interval for call duration
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
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
    <div className="flex relative flex-col items-center justify-between h-screen p-4 bg-black ">
      <div className="flex-1 flex justify-center items-center">
        <video ref={localVideoRef} onClick={()=>setIsSwitched(true)} autoPlay playsInline muted className={isSwitched?`absolute w-screen h-screen z-10 top-0 rounded-lg transform scale-x-[-1]`:`absolute h-32 lg:h-48  ml-7 bottom-16 right-6 rounded-lg border-[0.8px] z-20 transform scale-x-[-1] box5`}></video> {/* Flip the local video horizontally */}
        <video ref={remoteVideoRef} onClick={()=>setIsSwitched(false)} autoPlay playsInline className={isSwitched?`absolute h-32 lg:h-48  ml-7 bottom-16 right-6 rounded-lg border-[0.8px] z-20 transform scale-x-[-1] box5`:"absolute w-screen h-screen z-10 top-0 rounded-lg transform scale-x-[-1]"}></video>
      </div>
      <div className="flex justify-between lg:w-1/2 w-full mt-4">
        <div className="text-white absolute bottom-20 text-xl font-medium z-30 left-1/2 -translate-x-1/2">{Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}</div> {/* Display call duration */}
        <button onClick={endCall} className="px-4 z-30 py-2 bg-red-200 rounded-lg hover:bg-red-600 transition duration-200">
        <FcEndCall className="w-full text-2xl" />
        </button>
        <button onClick={toggleVideo} className={`px-4 z-30 py-2 ${isVideoEnabled ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-lg hover:bg-blue-600 transition duration-200`}>
          {isVideoEnabled ? <LuVideoOff className="w-full text-2xl"/> : <LuVideo className="w-full text-2xl"/>}
        </button>
        <button onClick={toggleAudio} className={`px-4 z-30 py-2 ${isAudioEnabled ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-lg hover:bg-blue-600 transition duration-200`}>
          {isAudioEnabled ? <AiOutlineAudioMuted className="w-full text-2xl"/> : <PiMicrophone className="w-full text-2xl"/>}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
