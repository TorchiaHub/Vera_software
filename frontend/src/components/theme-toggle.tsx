import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTauri } from '../hooks/useTauri';

interface ThemeToggleProps {
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  const { invoke, isReady } = useTauri();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
    
    // Salva nel database SQLite in modo completamente asincrono
    if (isReady) {
      invoke('update_settings', { 
        settings: { 
          theme: newTheme 
        } 
      }).catch(err => {
        console.error('Failed to save theme preference:', err);
      });
    }
  };

  const isDark = theme === 'dark';

  return (
    <button 
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full hover:bg-accent flex items-center justify-center transition-all duration-200"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Moon className="h-4 w-4 animate-in fade-in duration-200" />
        ) : (
          <Sun className="h-4 w-4 animate-in fade-in duration-200" />
        )}
      </div>
    </button>
  );
}
