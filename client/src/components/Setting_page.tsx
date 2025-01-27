"use client";
import '../app/globals.css';

import React, { useEffect, useRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";

const ThemeSettingsPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const popupRef = useRef<HTMLDivElement | null>(null);

  const themes = [
    "light",
    "darkwinter",
    "vintagecoffee",
    "pastelwarm",
    "vintagenature",
    "wintercold",
    "nightsea",
    "skinwarm",
    "earthvintage",
  ];

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    document.body.setAttribute("data-theme", theme); // Apply theme globally
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="cursor-default">
      {/* Button to toggle popup */}
      <button onClick={togglePopup} className="navbar-icon">
        <IoSettingsOutline className="text-2xl" />
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="popup p-4 drop-shadow-xl flex absolute top-[25%] z-10 rounded-lg left-20 w-[30rem]"
        >
          <div className="w-1/3 p-4  rounded-l-lg flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold">Theme Preview</h2>
            {/* <div
              className={`w-16 h-16 rounded-full mt-4`}
              style={{ background: selectedTheme === "light" ? "#f3f4f6" : selectedTheme === "darkwinter" ? "#1e293b" : "#feb47b" }}
            ></div> */}
          </div>

          <div className="w-2/3 flex flex-col space-y-4 p-4">
            <h1 className="text-2xl font-semibold mb-2">Choose Your Theme</h1>
            <div className="flex capitalize flex-col overflow-y-scroll popupscroll h-[20rem] gap-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedTheme === themeOption ? "bg-blue-500 text-white" : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1).replace(/([A-Z])/g, " $1")}
                </button>
              ))}
            </div>
            {/* <button
              onClick={togglePopup}
              className="self-end bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettingsPopup;
