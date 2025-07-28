import React from 'react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      // If currently system, switch to opposite of resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return '🌗'; // Half moon for system
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getTitle = () => {
    if (theme === 'system') {
      return `System theme (${resolvedTheme})`;
    }
    return `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`;
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      title={getTitle()}
      aria-label={getTitle()}
    >
      <span className="theme-icon">{getIcon()}</span>
      <span className="theme-indicator">
        <span className={`indicator ${resolvedTheme}`}></span>
      </span>
    </button>
  );
};
