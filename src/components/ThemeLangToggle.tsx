import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Languages, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { setLanguage } from '../lib/setLanguage';

export function ThemeLangToggle() {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const langs = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLang = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
          aria-label="Select Language"
        >
          <Languages className="w-5 h-5" />
          <span className="uppercase">{i18n.language}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} />
        </button>

        {isOpen && (
          <div className={cn(
            "absolute top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50",
            isRtl ? "left-0" : "right-0"
          )}>
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => selectLang(l.code)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  i18n.language === l.code 
                    ? "text-indigo-600 dark:text-indigo-400 font-bold bg-gray-50 dark:bg-slate-800/50" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                )}
                dir={l.code === 'ar' ? 'rtl' : 'ltr'}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
