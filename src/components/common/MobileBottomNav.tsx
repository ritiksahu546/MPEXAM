import React, { useState, useEffect } from 'react';
import { Home, Briefcase, FileText, Bookmark, Search } from 'lucide-react';
import { getSavedJobsCount, BOOKMARKS_EVENT } from '../../utils/bookmarks';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  onOpenSearch
}) => {
  const [savedCount, setSavedCount] = useState<number>(() => getSavedJobsCount());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedCount(getSavedJobsCount());
    };

    window.addEventListener(BOOKMARKS_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKMARKS_EVENT, handleUpdate);
  }, []);

  const isHome = currentRoute === 'home' || currentRoute === '';
  const isJobs = currentRoute === 'jobs' || (currentRoute.startsWith('category/') && !currentRoute.includes('admit') && !currentRoute.includes('result'));
  const isAdmitCards = currentRoute === 'admit-cards';
  const isSavedJobs = currentRoute === 'saved-jobs';

  const navItems = [
    {
      id: 'home',
      label: 'होम',
      icon: Home,
      isActive: isHome,
      onClick: () => onNavigate('home')
    },
    {
      id: 'jobs',
      label: 'नौकरी',
      icon: Briefcase,
      isActive: isJobs,
      onClick: () => onNavigate('jobs')
    },
    {
      id: 'admit-cards',
      label: 'एडमिट कार्ड',
      icon: FileText,
      isActive: isAdmitCards,
      onClick: () => onNavigate('admit-cards')
    },
    {
      id: 'saved-jobs',
      label: 'सुरक्षित',
      icon: Bookmark,
      badgeCount: savedCount,
      isActive: isSavedJobs,
      onClick: () => onNavigate('saved-jobs')
    },
    {
      id: 'search',
      label: 'खोजें',
      icon: Search,
      isActive: false,
      onClick: onOpenSearch
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1 flex items-center justify-around safe-area-pb"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            type="button"
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-lg transition-colors cursor-pointer select-none relative ${
              item.isActive
                ? 'text-blue-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110 text-blue-700' : 'text-slate-600'}`} />
              {item.badgeCount && item.badgeCount > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 font-extrabold text-[9px] min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center border border-white">
                  {item.badgeCount}
                </span>
              ) : null}
              {item.isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-700 rounded-full" />
              )}
            </div>
            <span className="text-[11px] leading-tight mt-1 truncate max-w-[64px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

