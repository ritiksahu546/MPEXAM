import React, { useState } from 'react';
import { LayoutGrid, Save, Check, Megaphone, Bell, Sparkles, AlertCircle } from 'lucide-react';
import { HomepageSectionsConfig, SiteSettings } from '../../types';

interface Props {
  sections: HomepageSectionsConfig;
  settings: SiteSettings;
  onSaveSections: (sections: HomepageSectionsConfig) => Promise<void>;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const HomepageManager: React.FC<Props> = ({
  sections,
  settings,
  onSaveSections,
  onSaveSettings
}) => {
  const [config, setConfig] = useState<HomepageSectionsConfig>(sections);
  const [tickerText, setTickerText] = useState(settings.tickerText || '');
  const [tickerLink, setTickerLink] = useState(settings.tickerLink || '');
  const [tickerEnabled, setTickerEnabled] = useState(settings.tickerEnabled !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggle = (key: keyof HomepageSectionsConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      await Promise.all([
        onSaveSections(config),
        onSaveSettings({
          ...settings,
          tickerText,
          tickerLink,
          tickerEnabled
        })
      ]);
      setSuccessMsg('होमपेज लेआउट एवं अलर्ट बार सफलतापूर्वक अपडेट किए गए!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      alert('सेटिंग्स सहेजने में त्रुटि: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-700" />
            <span>होमपेज अनुभाग प्रबंधन (Homepage Layout & Sections)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            होमपेज पर प्रदर्शित होने वाले अनुभागों को टॉगल बटन से सुरक्षित रूप से चालू या बंद करें।
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'सहेज रहे हैं...' : 'परिवर्तन सुरक्षित करें'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Announcement Bar Settings (Requirement #20) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                शीर्ष घोषणा पट्टी (Announcement Ticker Bar)
              </h3>
              <p className="text-xs text-slate-500">
                वेबसाइट के सबसे ऊपर चलने वाली ब्रेकिंग न्यूज व मुख्य अलर्ट
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tickerEnabled}
              onChange={e => setTickerEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-bold text-slate-700">
              {tickerEnabled ? 'सक्रिय (Visible)' : 'अक्षम (Hidden)'}
            </span>
          </label>
        </div>

        {tickerEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अलर्ट संदेश (Ticker Text)
              </label>
              <input
                type="text"
                value={tickerText}
                onChange={e => setTickerText(e.target.value)}
                placeholder="उदा. एमपी पुलिस कांस्टेबल 2026 आवेदन प्रारंभ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                क्लिक लिंक (Alert Link)
              </label>
              <input
                type="text"
                value={tickerLink}
                onChange={e => setTickerLink(e.target.value)}
                placeholder="job/mp-police-constable-recruitment-2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Homepage Section Blocks (Requirement #19) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800">
          मुख्य पृष्ठ अनुभाग टॉगल (Section Visibility Controls)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Featured Posts */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                खास विज्ञप्तियां (Featured Posts Carousel/Grid)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                जिन पोस्ट्स में "Featured" चेक किया गया है उनका शीर्ष प्रदर्शन
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.featuredPosts)}
              onChange={() => handleToggle('featuredPosts')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Latest Posts */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                नवीनतम नौकरियां व परिणाम (Latest Posts Table / Grid)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                हाल ही में प्रकाशित सभी सरकारी भर्तियां, परिणाम एवं प्रवेश पत्र
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.latestPosts)}
              onChange={() => handleToggle('latestPosts')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Trending Posts */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                ट्रेंडिंग पोस्ट्स (Trending / Most Viewed Posts)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                सर्वाधिक देखे जाने वाले पेज एवं प्रमुख सूचनाएं
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.trendingPosts)}
              onChange={() => handleToggle('trendingPosts')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Important Links */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                महत्वपूर्ण लिंक्स तालिका (Official Portals & Quick Links)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MP Online, MPESB, MPPSC, रोजगार पंजीयन के त्वरित लिंक्स
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.importantLinks)}
              onChange={() => handleToggle('importantLinks')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Category Quick Grid */}
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                शीर्ष श्रेणियां क्विक ग्रिड (Quick Categories Grid)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MP Police, MPPSC, Vyapam, पटवारी के त्वरित बटन
              </p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.quickCategoryGrid)}
              onChange={() => handleToggle('quickCategoryGrid')}
              className="w-5 h-5 text-blue-600 rounded cursor-pointer"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
