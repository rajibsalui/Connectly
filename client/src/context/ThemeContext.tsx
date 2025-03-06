"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Initialize theme
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    // Force a re-render by removing the attribute first
    document.documentElement.removeAttribute("data-theme");
    // Wait for next tick to apply new theme
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", newTheme);
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    }, 0);
  };

  if (!mounted) {
    return <div className="hidden">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
