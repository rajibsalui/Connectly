import React, { useEffect, useState } from 'react';
import { IoClose, IoDownload, IoExpand, IoContract } from 'react-icons/io5';

interface MediaPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  caption
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateDimensions = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      setDimensions({ 
        width: Math.min(maxWidth, 1200), // Set a max-width
        height: Math.min(maxHeight, 800)  // Set a max-height
      });
    };

    if (isOpen) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
    }

    return () => window.removeEventListener('resize', updateDimensions);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'f') {
        toggleFullscreen();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `download.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div 
        className="relative max-w-7xl w-full mx-4"
        onClick={e => e.stopPropagation()}
        style={{
          width: isFullscreen ? '100%' : dimensions.width,
          height: isFullscreen ? '100%' : dimensions.height
        }}
      >
        {/* Toolbar */}
        <div className="absolute -top-12 right-0 flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="btn btn-circle btn-ghost text-white hover:bg-base-100/20"
            title="Download media"
          >
            <IoDownload className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="btn btn-circle btn-ghost text-white hover:bg-base-100/20"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <IoContract className="w-5 h-5" />
            ) : (
              <IoExpand className="w-5 h-5" />
            )}
          </button>
          <button 
            onClick={onClose}
            className="btn btn-circle btn-ghost text-white hover:bg-base-100/20"
            title="Close preview"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Media Content */}
        <div className="bg-base-100 z-30 h-[100%] rounded-lg overflow-hidden shadow-2xl">
          {mediaType === 'video' ? (
            <video
              className="w-full h-full object-contain"
              controls
              autoPlay
              src={mediaUrl}
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={caption || "Media preview"}
              className="w-full h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onClick={e => e.stopPropagation()}
            />
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-100/50">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          )}

          {/* Caption */}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm">{caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;