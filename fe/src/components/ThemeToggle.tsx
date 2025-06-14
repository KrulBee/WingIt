"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "react-feather";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleToggleChange = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  return (
    <button
      onClick={handleToggleChange}
      className="relative p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 text-gray-700 dark:text-gray-300 hover:from-primary-100 hover:to-primary-200 dark:hover:from-primary-900 dark:hover:to-primary-800 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md group"
      aria-label={darkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={darkMode ? "Chế độ sáng" : "Chế độ tối"}
    >
      <div className="relative">
        {darkMode ? (
          <Sun size={18} className="transition-transform duration-300 group-hover:rotate-12" />
        ) : (
          <Moon size={18} className="transition-transform duration-300 group-hover:-rotate-12" />
        )}

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/20 to-secondary-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      </div>
    </button>
  );
}
