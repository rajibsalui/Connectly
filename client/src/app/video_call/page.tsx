'use client'
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the VideoCall component to avoid server-side rendering issues
const VideoCall = dynamic(() => import("@/components/VideoCall"), { ssr: false });

const Home: React.FC = () => {
  return (
    <div>
      <VideoCall />
    </div>
  );
};

export default Home;
