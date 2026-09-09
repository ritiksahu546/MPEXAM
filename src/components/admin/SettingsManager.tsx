import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Check, 
  Globe, 
  Search, 
  BarChart, 
  Share2, 
  Megaphone,
  Mail,
  ShieldAlert,
  Database
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface Props {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onSeedData?: () => Promise<void>;
}

export const SettingsManager: React.FC<Props> = ({ settings, onSaveSettings, onSeedData }) => {
  const [formData, setFormData] = useState<SiteSettings>(() => {
    return {
      ...settings,
      logoUrl: settings.logoUrl || settings.logo || '',
      logo: settings.logo || settings.logoUrl || '',
      faviconUrl: settings.faviconUrl || settings.favicon || '',
      favicon: settings.favicon || settings.faviconUrl || '',
      siteDescription: settings.siteDescription || settings.description || '',
      description: settings.description || settings.siteDescription || '',
      googleAdsenseClientId: settings.googleAdsenseClientId || settings.adSensePublisherId || '',
      adSensePublisherId: settings.adSensePublisherId || settings.googleAdsenseClientId || '',
      googleSearchConsoleVerification: settings.googleSearchConsoleVerification || settings.searchConsoleCode || '',
      searchConsoleCode: settings.searchConsoleCode || settings.googleSearchConsoleVerification || '',
      socialLinks: {
        whatsapp: settings.socialLinks?.whatsapp || settings.whatsappLink || '',
        telegram: settings.socialLinks?.telegram || settings.telegramLink || '',
        youtube: settings.socialLinks?.youtube || settings.youtubeLink || '',
        facebook: settings.socialLinks?.facebook || settings.facebookLink || ''
      }
    };
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const whatsapp = formData.socialLinks?.whatsapp || formData.whatsappLink || '';
      const telegram = formData.socialLinks?.telegram || formData.telegramLink || '';
      const youtube = formData.socialLinks?.youtube || formData.youtubeLink || '';
      const facebook = formData.socialLinks?.facebook || formData.facebookLink || '';

      const normalizedSettings: SiteSettings = {
        ...formData,
        logo: formData.logoUrl || formData.logo || '',
        logoUrl: formData.logoUrl || formData.logo || '',
        favicon: formData.faviconUrl || formData.favicon || '',
        faviconUrl: formData.faviconUrl || formData.favicon || '',
        description: formData.siteDescription || formData.description || '',
        siteDescription: formData.siteDescription || formData.description || '',
        whatsappLink: whatsapp,
        telegramLink: telegram,
        youtubeLink: youtube,
        facebookLink: facebook,
        socialLinks: {
          whatsapp,
          telegram,
          youtube,
          facebook
        },
        adSensePublisherId: formData.googleAdsenseClientId || formData.adSensePublisherId || '',
        googleAdsenseClientId: formData.googleAdsenseClientId || formData.adSensePublisherId || '',
        searchConsoleCode: formData.googleSearchConsoleVerification || formData.searchConsoleCode || '',
        googleSearchConsoleVerification: formData.googleSearchConsoleVerification || formData.searchConsoleCode || ''
      };

      await onSaveSettings(normalizedSettings);
      setFormData(normalizedSettings);
      setSuccessMsg('साइट सेटिंग्स सफलतापूर्वक सहेजी गईं!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      alert('सेटिंग्स सहेजने में त्रुटि: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedClick = async () => {
    if (!onSeedData) return;
    if (confirm('क्या आप डेमो डेटा (भर्तियां, श्रेणियां, विज्ञापन) को Firestore में सिंक / माइग्रेट करना चाहते हैं?')) {
      setIsSeeding(true);
      try {
        await onSeedData();
        setSuccessMsg('डेटा सफलतापूर्वक Firestore में सिंक किया गया!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        alert('डेटा सिंक विफल: ' + err.message);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-700" />
            <span>सामान्य साइट सेटिंग्स (Website Settings & SEO)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            वेबसाइट का नाम, लोगो, सोशल लिंक्स, Google AdSense और एनालिटिक्स क्रेडेंशियल
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSeedData && (
            <button
              type="button"
              onClick={handleSeedClick}
              disabled={isSeeding}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="डेमो डेटा को Firestore में कॉपी करें"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{isSeeding ? 'सिंक हो रहा है...' : 'Sync Data to Firestore'}</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'सहेज रहे हैं...' : 'सेटिंग्स सहेजें'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>वेबसाइट पहचान (Identity & Branding)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">वेबसाइट नाम (Site Name) *</label>
            <input
              type="text"
              required
              value={formData.siteName}
              onChange={e => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">साइट टैगलाइन (Tagline)</label>
            <input
              type="text"
              value={formData.siteTagline || ''}
              onChange={e => setFormData({ ...formData, siteTagline: e.target.value })}
              placeholder="मध्य प्रदेश का विश्वसनीय रोजगार एवं परीक्षा पोर्टल"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">लोगो URL (Logo Image URL)</label>
            <input
              type="url"
              value={formData.logoUrl || ''}
              onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">फेविकॉन URL (Favicon URL)</label>
            <input
              type="url"
              value={formData.faviconUrl || ''}
              onChange={e => setFormData({ ...formData, faviconUrl: e.target.value })}
              placeholder="/favicon.ico"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">वेबसाइट विवरण (Site Description)</label>
          <textarea
            rows={2}
            value={formData.siteDescription || ''}
            onChange={e => setFormData({ ...formData, siteDescription: e.target.value })}
            placeholder="MPPSC, MPESB (व्यापम), एमपी पुलिस, पटवारी, शिक्षक एवं सभी मध्य प्रदेश सरकारी भर्तियों की त्वरित जानकारी..."
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">आधिकारिक ईमेल (Contact Email)</label>
            <input
              type="email"
              value={formData.contactEmail || ''}
              onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="support@mpexamupdates.in"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">हेल्पलाइन फोन (Phone / Helpline)</label>
            <input
              type="text"
              value={formData.contactPhone || ''}
              onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+91 755 000 0000"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Default SEO Settings (Requirement #21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>डिफ़ॉल्ट SEO एवं सर्च इंजन सेटिंग्स</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              डिफ़ॉल्ट SEO टाइटल (Default Meta Title)
            </label>
            <input
              type="text"
              value={formData.defaultSeoTitle || ''}
              onChange={e => setFormData({ ...formData, defaultSeoTitle: e.target.value })}
              placeholder="MP Exam Update - MP Latest Govt Jobs, Admit Card, Result 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              डिफ़ॉल्ट SEO विवरण (Default Meta Description)
            </label>
            <textarea
              rows={2}
              value={formData.defaultSeoDescription || ''}
              onChange={e => setFormData({ ...formData, defaultSeoDescription: e.target.value })}
              placeholder="मध्य प्रदेश की समस्त सरकारी भर्तियां, MP Police, MPPSC, MPESB प्रवेश पत्र, परीक्षा परिणाम एवं सिलेबस की आधिकारिक जानकारी।"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Search Console सत्यापन कोड (Search Console Verification HTML Tag / Token)
            </label>
            <input
              type="text"
              value={formData.googleSearchConsoleVerification || ''}
              onChange={e => setFormData({ ...formData, googleSearchConsoleVerification: e.target.value })}
              placeholder="google-site-verification=abcdef12345..."
              className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Analytics & AdSense (Requirement #21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <BarChart className="w-4 h-4 text-blue-600" />
          <span>Google AdSense एवं Analytics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Analytics ID (GA4 Measurement ID)
            </label>
            <input
              type="text"
              value={formData.googleAnalyticsId || ''}
              onChange={e => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google AdSense Client ID (Publisher ID)
            </label>
            <input
              type="text"
              value={formData.googleAdsenseClientId || ''}
              onChange={e => setFormData({ ...formData, googleAdsenseClientId: e.target.value })}
              placeholder="ca-pub-1234567890123456"
              className="w-full px-3 py-2 font-mono border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Social Links (Requirement #21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-600" />
          <span>सोशल मीडिया एवं कम्युनिटी लिंक्स (Social Links)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Channel / Group</label>
            <input
              type="url"
              value={formData.socialLinks?.whatsapp || ''}
              onChange={e => setFormData({ 
                ...formData, 
                socialLinks: { ...(formData.socialLinks || {}), whatsapp: e.target.value } 
              })}
              placeholder="https://whatsapp.com/channel/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Channel</label>
            <input
              type="url"
              value={formData.socialLinks?.telegram || ''}
              onChange={e => setFormData({ 
                ...formData, 
                socialLinks: { ...(formData.socialLinks || {}), telegram: e.target.value } 
              })}
              placeholder="https://t.me/mpexamupdate"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel</label>
            <input
              type="url"
              value={formData.socialLinks?.youtube || ''}
              onChange={e => setFormData({ 
                ...formData, 
                socialLinks: { ...(formData.socialLinks || {}), youtube: e.target.value } 
              })}
              placeholder="https://youtube.com/@mpexamupdate"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page</label>
            <input
              type="url"
              value={formData.socialLinks?.facebook || ''}
              onChange={e => setFormData({ 
                ...formData, 
                socialLinks: { ...(formData.socialLinks || {}), facebook: e.target.value } 
              })}
              placeholder="https://facebook.com/mpexamupdate"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
