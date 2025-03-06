'use client'
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { IoArrowBack } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  IoSunny, IoMoon, IoBrush, IoColorPalette, IoLeaf, IoFlower,
  IoHeart, IoRocket, IoPulse, IoWater, IoSnow, IoDiamond
} from 'react-icons/io5';

const themes = [
  { name: 'light', label: 'Light', icon: <IoSunny />, description: 'Clean and bright interface' },
  { name: 'dark', label: 'Dark', icon: <IoMoon />, description: 'Easy on the eyes' },
  { name: 'cupcake', label: 'Cupcake', icon: <IoColorPalette />, description: 'Sweet pastel colors' },
  { name: 'bumblebee', label: 'Bumblebee', icon: <IoFlower />, description: 'Yellow and black' },
  { name: 'emerald', label: 'Emerald', icon: <IoLeaf />, description: 'Green and professional' },
  { name: 'corporate', label: 'Corporate', icon: <IoBrush />, description: 'Business-like design' },
  { name: 'synthwave', label: 'Synthwave', icon: <IoRocket />, description: 'Retro-futuristic' },
  { name: 'retro', label: 'Retro', icon: <IoHeart />, description: 'Classic vintage look' },
  { name: 'cyberpunk', label: 'Cyberpunk', icon: <IoPulse />, description: 'High-tech urban style' },
  { name: 'valentine', label: 'Valentine', icon: <IoHeart />, description: 'Romantic theme' },
  { name: 'aqua', label: 'Aqua', icon: <IoWater />, description: 'Cool ocean colors' },
  { name: 'winter', label: 'Winter', icon: <IoSnow />, description: 'Cold and crisp design' },
  { name: 'luxury', label: 'Luxury', icon: <IoDiamond />, description: 'Elegant and premium' }
];

const ThemePage = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(theme); // Add this line

  useEffect(() => {
    setMounted(true);
    setSelectedTheme(theme); // Initialize selectedTheme with current theme
  }, [theme]);

  const handleThemeChange = async (themeName: string) => {
    try {
      setIsChanging(true);
      setSelectedTheme(themeName); // Update selected theme
      setTheme(themeName);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(`Theme changed to ${themeName}`);
    } catch (error) {
      console.error('Error changing theme:', error);
      toast.error('Failed to change theme');
    } finally {
      setIsChanging(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-circle"
          >
            <IoArrowBack className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Theme Settings</h1>
            <p className="text-base-content/60">Choose your preferred appearance</p>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => handleThemeChange(themeOption.name)}
              disabled={isChanging}
              className={`
                card bg-base-200 hover:bg-base-300 transition-all duration-200
                ${selectedTheme === themeOption.name ? 'ring-2 ring-primary' : ''}
                ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              data-theme={themeOption.name}
            >
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-base-300 flex items-center justify-center text-primary">
                    {React.cloneElement(themeOption.icon, { className: 'w-6 h-6' })}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{themeOption.label}</h3>
                    <p className="text-sm text-base-content/60">{themeOption.description}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 flex gap-2">
                  <div className="badge badge-primary">Primary</div>
                  <div className="badge badge-secondary">Secondary</div>
                  <div className="badge badge-accent">Accent</div>
                </div>
              </div>
              {isChanging && selectedTheme === themeOption.name && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemePage;
