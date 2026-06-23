import { useEffect } from 'react';

const ThemeInitializer = () => {
  useEffect(() => {
    // Initialize dark mode from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return null;
};

export default ThemeInitializer;
