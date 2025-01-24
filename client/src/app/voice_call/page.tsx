'use client'
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the VoiceCall component to avoid server-side rendering issues
const VoiceCall = dynamic(() => import('@/components/VoiceCall'), { ssr: false });

const VoiceCallPage: React.FC = () => {
  return (
    <div>
      <VoiceCall />
    </div>
  );
};

export default VoiceCallPage;
