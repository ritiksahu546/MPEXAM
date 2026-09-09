import React from 'react';
import { SiteSettings, Category, ImportantLink } from '../../types';
import { ShieldAlert, Heart, Send, MessageCircle, Youtube, Facebook, Mail, ExternalLink, ArrowUp } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  categories: Category[];
  importantLinks?: ImportantLink[];
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<Props> = ({ settings, categories, importantLinks = [], onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategories = categories.filter(c => c.active !== false).slice(0, 8);
  const activeLinks = (importantLinks.length > 0 ? importantLinks.filter(l => l.active !== false) : []).slice(0, 8);

  const telegramUrl = settings.socialLinks?.telegram || settings.telegramLink;
  const whatsappUrl = settings.socialLinks?.whatsapp || settings.whatsappLink;
  const youtubeUrl = settings.socialLinks?.youtube || settings.youtubeLink;
  const facebookUrl = settings.socialLinks?.facebook || settings.facebookLink;

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 pt-10 pb-6 mt-12 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Portal Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {settings.logoUrl || settings.logo ? (
                <img
                  src={settings.logoUrl || settings.logo}
                  alt={settings.siteName || 'MP Exam Update'}
                  className="h-9 w-auto max-w-[130px] object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-amber-500 text-white flex items-center justify-center font-black text-lg">
                  <span>{(settings.siteName || 'MP').slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div>
                <span className="text-lg font-black text-white tracking-tight">{settings.siteName || 'MP Exam Update'}</span>
                <p className="text-[11px] text-amber-400 font-medium">{settings.siteTagline || 'मध्य प्रदेश भर्ती व परीक्षा पोर्टल'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.siteDescription || settings.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors"
                  title="Telegram Group"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                  title="WhatsApp Channel"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                  title="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors"
                  title="Facebook Page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                  title="Email Support"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>प्रमुख श्रेणियां</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {activeCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`category/${cat.slug}`)}
                    className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>›</span>
                    <span>{cat.nameHindi}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Important Official Portals */}
          <div>
            <h4 className="text-white font-bold text-base mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>महत्वपूर्ण शासकीय वेबसाइट</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {(activeLinks.length > 0
                ? activeLinks
                : [
                    { id: '1', title: 'MPPSC Official Indore', url: 'https://mppsc.mp.gov.in' },
                    { id: '2', title: 'MPESB व्यापम भोपाल', url: 'https://esb.mp.gov.in' },
                    { id: '3', title: 'MP Online पोर्टल', url: 'https://www.mponline.gov.in' },
                    { id: '4', title: 'MP रोजगार पंजीयन', url: 'https://mprojgar.gov.in' },
                    { id: '5', title: 'MP हाईकोर्ट जबलपुर', url: 'https://mphc.gov.in' },
                    { id: '6', title: 'समग्र सामाजिक सुरक्षा पोर्टल', url: 'https://samagra.gov.in' }
                  ]
              ).map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate">{link.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 ml-1.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Quick Links & Legal */}
          <div>
            <h4 className="text-white font-bold text-base mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>सूचना एवं नीतियां</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white">हमारे बारे में (About Us)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white">संपर्क करें (Contact Us)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white">गोपनीयता नीति (Privacy Policy)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-white">नियम व शर्तें (Terms & Conditions)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="hover:text-white">अस्वीकरण (Disclaimer)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('advertisement')} className="hover:text-white">विज्ञापन नीति (Advertisement)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('sitemap')} className="hover:text-white">साइटमैप (Sitemap.xml)</button>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer Note */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-400 mb-6 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>वैधानिक अस्वीकरण:</strong> mpexamupdates.in किसी भी सरकारी विभाग अथवा आयोग की आधिकारिक वेबसाइट नहीं है। यह एक शैक्षणिक एवं सूचनात्मक पोर्टल है, जिसका उद्देश्य मध्य प्रदेश के युवाओं को सरकारी भर्ती व परीक्षा की ताज़ा जानकारी प्रदान करना है। आवेदन से पूर्व आधिकारिक विज्ञापन का अवलोकन अवश्य करें।
          </p>
        </div>

        {/* Bottom copyright and back to top */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {settings.copyrightText || settings.footerText || (
              <>
                © 2026 <strong>{settings.siteName || 'MP Exam Update'}</strong>. सर्वाधिकार सुरक्षित (All Rights Reserved).
              </>
            )}
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <span>शीर्ष पर जाएं (Back to Top)</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
