import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  showMenu?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showMenu = false,
  className = '',
  size = 'md'
}) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const buttonSizeClass = size === 'sm' ? 'p-1.5 rounded-lg' : 'h-9 w-9 rounded-xl';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-4 h-4';

  if (!showMenu) {
    return (
      <button
        type="button"
        id="theme-quick-toggle"
        onClick={toggleTheme}
        className={`${buttonSizeClass} transition-all cursor-pointer flex items-center justify-center shrink-0 ${
          isDark
            ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700/80 shadow-xs'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shadow-xs'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className={iconSize} />
        ) : (
          <Moon className={iconSize} />
        )}
      </button>
    );
  }

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5 text-blue-400" /> },
    { mode: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  return (
    <div className={`relative shrink-0 ${className}`} ref={containerRef}>
      <button
        type="button"
        id="theme-dropdown-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        className={`${buttonSizeClass} transition-all cursor-pointer flex items-center justify-center shrink-0 ${
          isDark
            ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700 shadow-xs'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-xs'
        }`}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label="Select theme"
      >
        {isDark ? (
          <Moon className={iconSize} />
        ) : (
          <Sun className={iconSize} />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Appearance
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setTheme(opt.mode);
                  setMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
