import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { Language } from '../types';
import { cn } from '../utils/cn';

interface LanguageSwitcherProps {
  variant?: 'header' | 'auth';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'header', 
  className 
}) => {
  const { session, setLanguage } = useStore();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: "en-US" as Language, label: "English", flag: "🇺🇸" },
    { code: "zh-CN" as Language, label: "中文 (简体)", flag: "🇨🇳" },
  ];

  const handleLanguageChange = (langCode: Language) => {
    console.log('LanguageSwitcher: Changing language to', langCode);
    
    // Set language in store (this will trigger re-renders across the app)
    setLanguage(langCode);
    
    // Persist to localStorage for future sessions
    localStorage.setItem('preferred-language', langCode);
    
    // Close dropdown
    setIsOpen(false);
    
    // Force a small delay to ensure all components re-render with new language
    setTimeout(() => {
      // Trigger a custom event that components can listen to for immediate updates
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: langCode } 
      }));
      
      // Force a page refresh if needed (as a fallback)
      console.log('Language change completed, current language:', langCode);
    }, 100);
  };

  // Load persisted language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && savedLanguage !== session.language) {
      setLanguage(savedLanguage);
    }
  }, []);

  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === session.language);
    return currentLang?.label || 'English';
  };

  const getCurrentLanguageFlag = () => {
    const currentLang = languages.find(lang => lang.code === session.language);
    return currentLang?.flag || '🇺🇸';
  };

  if (variant === 'auth') {
    return (
      <div className={cn("relative", className)} ref={ref}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-[13px] text-amazon-link hover:underline"
        >
          <span>{getCurrentLanguageFlag()}</span>
          <span>{session.language === 'zh-CN' ? '中文' : 'English'}</span>
          <ChevronDown size={12} className={cn("transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute top-8 right-0 w-48 bg-white shadow-xl border border-gray-200 py-2 rounded-sm animate-in fade-in slide-in-from-top-1 z-[100]">
            <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b mb-1">
              {t("selectLanguage")}
            </div>
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="px-4 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span
                    className={cn(
                      "text-sm font-medium text-amazon-text",
                      session.language === lang.code && "font-black text-amazon-teal"
                    )}
                  >
                    {lang.label}
                  </span>
                </div>
                {session.language === lang.code && (
                  <span className="text-amazon-teal">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Header variant (enhanced)
  return (
    <div className={cn("relative h-full", className)} ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-full flex items-center px-2 hover:bg-white/10 cursor-pointer transition-colors rounded",
          isOpen && "bg-white/10"
        )}
      >
        <span className="text-[11px] font-bold uppercase leading-none">
          {session.language.split('-')[0]}
        </span>
        <ChevronDown
          size={12}
          className={cn("ml-1 opacity-60 transition-transform", isOpen && "rotate-180")}
        />
      </div>

      {isOpen && (
        <div className="absolute top-11 right-0 w-48 bg-white shadow-xl border border-gray-200 py-2 rounded-b-sm animate-in fade-in slide-in-from-top-1 z-[100]">
          <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b mb-1">
            {t("selectLanguage")}
          </div>
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="px-4 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span
                  className={cn(
                    "text-sm font-medium text-amazon-text",
                    session.language === lang.code && "font-black text-amazon-teal"
                  )}
                >
                  {lang.label}
                </span>
              </div>
              {session.language === lang.code && (
                <span className="text-amazon-teal">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;