import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import CallEnd from './Call_End'; // Import the CallEnd component

const SOCKET_SERVER_URL = "http://localhost:3000";

const VoiceCall: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(true);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) setupPeerConnection();
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    });

    socketRef.current.on("answer", async (answer: RTCSessionDescriptionInit) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

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

    localStreamRef.current?.getTracks().forEach((track) => {
      peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
    });

    peerConnectionRef.current.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", event.candidate);
      }
    };
  };

  const startLocalAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      setIsCallActive(true); // Automatically start the call after getting the local audio stream
    } catch (error) {
      console.error("Error accessing audio devices:", error);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    localStreamRef.current?.getTracks().forEach(track => track.stop());
  };

  useEffect(() => {
    startLocalAudioStream();
  }, []);

  if (!isCallActive) {
    return <CallEnd />; // Show CallEnd component when the call is not active
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Voice Call</h1>
      <div className="flex flex-col items-center">
        <audio ref={localAudioRef} autoPlay muted className="hidden"></audio>
        <audio ref={remoteAudioRef} autoPlay className="hidden"></audio>
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200">
          End Call
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;
