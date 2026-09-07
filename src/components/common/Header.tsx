import React, { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  Send, 
  MessageCircle, 
  Lock, 
  Bell, 
  ChevronDown, 
  Calendar as CalendarIcon,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SiteSettings, Category } from '../../types';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  settings: SiteSettings;
  categories: Category[];
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  settings,
  categories,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format today's date in Hindi
  const today = new Date();
  const dateString = today.toLocaleDateString('hi-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleNav = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'होम', route: 'home' },
    { label: 'सरकारी नौकरी', route: 'jobs' },
    { label: 'एडमिट कार्ड', route: 'admit-cards' },
    { label: 'रिजल्ट', route: 'results' },
    { label: 'आंसर की', route: 'answer-keys' },
    { label: 'MPPSC', route: 'category/mppsc' },
    { label: 'MPESB व्यापम', route: 'category/mpesb' },
    { label: 'सरकारी योजनाएँ', route: 'category/sarkari-yojana' },
    { label: 'परीक्षा कैलेंडर', route: 'category/exam-calendar' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top micro bar for date, state alert, and social channels */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-3 sm:px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{dateString}</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-medium">मध्य प्रदेश का विश्वसनीय रोजगार एवं परीक्षा पोर्टल</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a 
              href={settings.telegramLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-300 hover:text-sky-200 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>टेलीग्राम ग्रुप</span>
            </a>
            <a 
              href={settings.whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>व्हाट्सएप चैनल</span>
            </a>
            <button
              onClick={() => handleNav('admin')}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] transition-colors"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>{isAdminLoggedIn ? 'एडमिन पैनल' : 'एडमिन लॉगिन'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Action Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <div 
          onClick={() => handleNav('home')}
          className="cursor-pointer flex items-center gap-2.5 shrink-0 select-none group"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-800 via-blue-700 to-amber-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md border border-blue-900/20 group-hover:scale-105 transition-transform">
            <span>MP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-blue-800 transition-colors">
                MP Exam Update
              </span>
              <span className="hidden sm:inline-block bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded uppercase">
                MP 2026
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-none mt-1">
              मध्य प्रदेश सरकारी नौकरी एवं परीक्षा पोर्टल
            </p>
          </div>
        </div>

        {/* Quick Search trigger on desktop and mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-150 border border-slate-300/80 rounded-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm text-slate-500 hover:text-slate-800 transition-colors shadow-2xs group w-36 sm:w-64 md:w-80 justify-between"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">भर्ती, एडमिट कार्ड खोजें...</span>
            </span>
            <kbd className="hidden md:inline-block text-[10px] font-semibold bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Direct Telegram join CTA on mobile / tablet */}
          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>ज्वाइन टेलीग्राम</span>
          </a>
        </div>
      </div>

      {/* Main Desktop Navigation bar */}
      <nav aria-label="Main Navigation" className="hidden lg:block bg-blue-800 text-white border-t border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <ul className="flex items-center space-x-1 list-none p-0 m-0">
            {navLinks.map((link) => {
              const active = currentRoute === link.route || (link.route !== 'home' && currentRoute.startsWith(link.route));
              return (
                <li key={link.route}>
                  <button
                    onClick={() => handleNav(link.route)}
                    className={`px-3.5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                      active
                        ? 'bg-blue-950 text-amber-300 border-b-2 border-amber-400'
                        : 'text-blue-50 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleNav('category/mppsc')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>MPPSC 2026</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 shadow-xl space-y-3 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={settings.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-sky-600 text-white p-2.5 rounded-lg font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram ग्रुप</span>
            </a>
            <a
              href={settings.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white p-2.5 rounded-lg font-bold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp चैनल</span>
            </a>
          </div>

          <div className="divide-y divide-slate-100 font-medium text-sm">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => handleNav(link.route)}
                className="w-full text-left py-2.5 px-2 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-slate-300 text-xs">›</span>
              </button>
            ))}
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left py-2.5 px-2 text-amber-700 font-bold flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'एडमिन डैशबोर्ड' : 'एडमिन लॉगिन'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            {dateString}
          </div>
        </div>
      )}
    </header>
  );
};
