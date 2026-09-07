import React from 'react';
import { SiteSettings, Category } from '../../types';
import { ShieldAlert, Heart, Send, MessageCircle, Youtube, Mail, ExternalLink, ArrowUp } from 'lucide-react';

interface Props {
  settings: SiteSettings;
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<Props> = ({ settings, categories, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 pt-10 pb-6 mt-12 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: Portal Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-amber-500 text-white flex items-center justify-center font-black text-lg">
                <span>MP</span>
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">MP Exam Update</span>
                <p className="text-[11px] text-amber-400 font-medium">मध्य प्रदेश भर्ती व परीक्षा पोर्टल</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-colors"
                title="Telegram Group"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                title="WhatsApp Channel"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={settings.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                title="YouTube Channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.contactEmail}`}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>प्रमुख श्रेणियां</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {categories.slice(0, 8).map((cat) => (
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
              <li>
                <a href="https://mppsc.mp.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>MPPSC Official Indore</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://esb.mp.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>MPESB व्यापम भोपाल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.mponline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>MP Online पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://mprojgar.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>MP रोजगार पंजीयन</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://mphc.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>MP हाईकोर्ट जबलपुर</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://samagra.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center justify-between">
                  <span>समग्र सामाजिक सुरक्षा पोर्टल</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
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
            <strong>वैधानिक अस्वीकरण:</strong> mpexamupdate.in किसी भी सरकारी विभाग अथवा आयोग की आधिकारिक वेबसाइट नहीं है। यह एक शैक्षणिक एवं सूचनात्मक पोर्टल है, जिसका उद्देश्य मध्य प्रदेश के युवाओं को सरकारी भर्ती व परीक्षा की ताज़ा जानकारी प्रदान करना है। आवेदन से पूर्व आधिकारिक विज्ञापन का अवलोकन अवश्य करें।
          </p>
        </div>

        {/* Bottom copyright and back to top */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 <strong>MP Exam Update</strong>. सर्वाधिकार सुरक्षित (All Rights Reserved).
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
