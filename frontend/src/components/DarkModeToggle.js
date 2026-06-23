import React, { useState } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;
