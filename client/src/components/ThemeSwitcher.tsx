'use client'
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  IoSunny, 
  IoMoon, 
  IoColorPalette,
  IoLeaf,
  IoDiamond,
  IoSkull,
  IoWater,
  IoHeart,
  IoRocket,
  IoBrush,
  IoFlower
} from 'react-icons/io5';

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { name: 'light', label: 'Light', icon: <IoSunny className="w-5 h-5" /> },
  { name: 'dark', label: 'Dark', icon: <IoMoon className="w-5 h-5" /> },
  { name: 'cupcake', label: 'Cupcake', icon: <IoColorPalette className="w-5 h-5" /> },
  { name: 'bumblebee', label: 'Bumblebee', icon: <IoFlower className="w-5 h-5" /> },
  { name: 'emerald', label: 'Emerald', icon: <IoLeaf className="w-5 h-5" /> },
  { name: 'corporate', label: 'Corporate', icon: <IoBrush className="w-5 h-5" /> },
  { name: 'synthwave', label: 'Synthwave', icon: <IoRocket className="w-5 h-5" /> },
  { name: 'retro', label: 'Retro', icon: <IoHeart className="w-5 h-5" /> },
  { name: 'cyberpunk', label: 'Cyberpunk', icon: <IoSkull className="w-5 h-5" /> },
  { name: 'valentine', label: 'Valentine', icon: <IoHeart className="w-5 h-5" /> },
  { name: 'aqua', label: 'Aqua', icon: <IoWater className="w-5 h-5" /> },
  { name: 'luxury', label: 'Luxury', icon: <IoDiamond className="w-5 h-5" /> }
];

const ThemeSwitcher = ({ isOpen, onClose }: ThemeSwitcherProps) => {
  const { theme, setTheme: setGlobalTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (themeName: string) => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
    setGlobalTheme(themeName);
    onClose();
  };

  if (!mounted) return null;

  return (
    <div className="p-6 bg-base-100">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <IoColorPalette className="text-primary w-6 h-6" />
        Choose Theme
      </h2>

      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {themes.map((themeOption) => (
          <button
            key={themeOption.name}
            onClick={() => handleThemeChange(themeOption.name)}
            className={`
              btn btn-outline gap-3 h-auto py-4 px-4
              hover:scale-[1.02] transition-transform duration-200
              ${theme === themeOption.name ? 'btn-primary' : ''}
            `}
            data-theme={themeOption.name}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                {themeOption.icon}
              </div>
              <span className="font-medium">{themeOption.label}</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-accent"></div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Theme Preview */}
      <div className="mt-6 p-4 rounded-lg bg-base-200">
        <h3 className="text-sm font-medium mb-3">Preview Current Theme</h3>
        <div className="flex flex-wrap gap-2" data-theme={theme}>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-accent">Accent</button>
            <button className="btn btn-neutral">Neutral</button>
            <button className="btn btn-ghost">Ghost</button>
            <button className="btn btn-link">Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
