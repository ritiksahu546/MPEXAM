import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';
import { SiteSettings } from '../../types';

interface Props {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const AnnouncementBar: React.FC<Props> = ({ settings, onNavigate }) => {
  const isSectionEnabled = settings.homepageSections?.announcementBar !== false;
  const isBarEnabled = (settings.announcement?.enabled ?? settings.tickerEnabled) !== false;
  const text = settings.announcement?.text || settings.tickerText;
  const link = settings.announcement?.link || settings.tickerLink;

  if (!isSectionEnabled || !isBarEnabled || !text) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      e.preventDefault();
      const cleanPath = link.replace(/^#\/?/, '').replace(/^\//, '');
      onNavigate(cleanPath);
    }
  };

  return (
    <aside aria-label="Announcement" className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 font-bold shrink-0 bg-red-700/80 px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>ताज़ा अपडेट</span>
        </div>
        
        <div className="flex-1 min-w-0 truncate">
          {link ? (
            <a 
              href={link} 
              onClick={handleClick}
              className="hover:underline flex items-center gap-1.5 font-medium truncate group"
            >
              <span className="truncate">{text}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>
          ) : (
            <span className="font-medium truncate">{text}</span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0 text-[11px] text-amber-100 font-medium">
          <span>मध्य प्रदेश की समस्त सरकारी भर्तियां</span>
        </div>
      </div>
    </aside>
  );
};
