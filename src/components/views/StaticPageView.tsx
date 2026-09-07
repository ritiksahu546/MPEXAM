import React from 'react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { SiteSettings } from '../../types';
import { ShieldCheck, Mail, Send, MessageCircle, AlertTriangle, FileText, Sparkles, Building } from 'lucide-react';

interface Props {
  pageType: 'about' | 'contact' | 'privacy-policy' | 'terms-and-conditions' | 'disclaimer' | 'advertisement';
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const StaticPageView: React.FC<Props> = ({ pageType, settings, onNavigate }) => {
  const pageData = {
    about: {
      title: 'हमारे बारे में (About Us)',
      subtitle: 'मध्य प्रदेश के युवाओं के लिए सबसे तेज़ एवं प्रामाणिक परीक्षा सूचना मंच',
      content: (
        <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
          <p>
            <strong>MP Exam Update (mpexamupdate.in)</strong> मध्य प्रदेश का एक स्वतंत्र, विश्वसनीय और समर्पित शैक्षणिक एवं रोजगार सूचना पोर्टल है। हमारा मुख्य उद्देश्य राज्य के लाखों प्रतियोगी छात्रों तक सरकारी नौकरियों, परीक्षाओं, प्रवेश पत्रों, परीक्षा परिणामों, उत्तर कुंजियों तथा सरकारी योजनाओं की सटीक और ताज़ा जानकारी पहुँचाना है।
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">हमारा उद्देश्य एवं दृष्टि (Our Mission):</h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>मध्य प्रदेश के ग्रामीण व शहरी हर क्षेत्र के छात्रों तक रोजगार अधिसूचनाएं समय पर पहुँचाना।</li>
            <li>भ्रामक और फर्जी खबरों से छात्रों को बचाना तथा केवल सत्यापित व आधिकारिक स्रोतों से जानकारी देना।</li>
            <li>आसान और स्पष्ट हिंदी भाषा में जटिल सरकारी अधिसूचनाओं को सरल बनाकर समझाना।</li>
            <li>MPPSC, MPESB (व्यापम), पुलिस भर्ती, शिक्षक पात्रता, पटवारी, एवं न्यायालयीन भर्तियों की समयबद्ध जानकारी।</li>
          </ul>
          <p>
            हम निरंतर अपनी तकनीकी क्षमता एवं सूचना तंत्र को आधुनिकतम बना रहे हैं ताकि मोबाइल पर भी यह पोर्टल पलक झपकते खुले और छात्रों का कीमती समय बचे।
          </p>
        </div>
      )
    },
    contact: {
      title: 'संपर्क करें (Contact Us)',
      subtitle: 'किसी भी प्रश्न, सुझाव अथवा सहायता के लिए हमसे सीधे संपर्क करें',
      content: (
        <div className="space-y-5 text-slate-800 text-sm leading-relaxed">
          <p>
            यदि आपके पास MP Exam Update पोर्टल के संबंध में कोई सुझाव, प्रश्न, या प्रतिक्रिया है, तो आप नीचे दिए गए माध्यमों से हमारी सहायता टीम से संपर्क कर सकते हैं:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-700 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">आधिकारिक ई-मेल</strong>
                <a href={`mailto:${settings.contactEmail}`} className="text-blue-700 hover:underline text-xs sm:text-sm">
                  {settings.contactEmail}
                </a>
                <p className="text-xs text-slate-500 mt-0.5">24 से 48 घंटे के भीतर प्रत्युत्तर दिया जाता है</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
              <Send className="w-5 h-5 text-sky-600 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">टेलीग्राम हेल्पलाइन</strong>
                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline text-xs sm:text-sm">
                  @mpexamupdate_official
                </a>
                <p className="text-xs text-slate-500 mt-0.5">ताज़ा अलर्ट व चर्चा के लिए जुड़े</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <h4 className="font-bold text-slate-900 mb-1">कृपया ध्यान दें:</h4>
            <p className="text-xs text-slate-600">
              हम किसी भी सरकारी भर्ती के लिए आवेदन स्वीकार नहीं करते और न ही हम कोई सरकारी आयोग हैं। कृपया अपना एडमिट कार्ड डाउनलोड करने या फॉर्म भरने हेतु संबंधित आधिकारिक वेबसाइट (जैसे MPOnline, MPPSC) का ही उपयोग करें।
            </p>
          </div>
        </div>
      )
    },
    'privacy-policy': {
      title: 'गोपनीयता नीति (Privacy Policy)',
      subtitle: 'आपकी निजता और डेटा सुरक्षा के प्रति हमारी प्रतिबद्धता',
      content: (
        <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
          <p>
            MP Exam Update पर हम अपने पाठकों की गोपनीयता का अत्यधिक सम्मान करते हैं। यह नीति स्पष्ट करती है कि जब आप हमारी वेबसाइट पर आते हैं, तो कौन सी जानकारी एकत्र की जा सकती है और उसका उपयोग कैसे किया जाता है।
          </p>
          <h4 className="font-bold text-slate-900">1. लॉग फाइल्स और एनालिटिक्स</h4>
          <p className="text-xs sm:text-sm text-slate-700">
            अन्य अधिकांश वेबसाइटों की तरह हम मानक लॉग फाइलों और कुकीज़ (Google Analytics) का उपयोग उपयोगकर्ता अनुभव को बेहतर बनाने, पृष्ठ लोड गति को मापने तथा आगंतुकों की संख्या का सांख्यिकीय विश्लेषण करने हेतु करते हैं।
          </p>
          <h4 className="font-bold text-slate-900">2. कुकीज़ एवं गूगल एडसेंस (Google AdSense)</h4>
          <p className="text-xs sm:text-sm text-slate-700">
            तृतीय-पक्ष विक्रेता, जिसमें Google शामिल है, हमारी वेबसाइट पर आपके पिछले विज़िट के आधार पर विज्ञापन प्रदर्शित करने के लिए कुकीज़ (DoubleClick DART Cookie) का उपयोग कर सकते हैं। पाठक Google की विज्ञापन और सामग्री नेटवर्क गोपनीयता नीति पर जाकर व्यक्तिगत विज्ञापनों से बाहर निकल सकते हैं।
          </p>
          <h4 className="font-bold text-slate-900">3. व्यक्तिगत जानकारी का संग्रह</h4>
          <p className="text-xs sm:text-sm text-slate-700">
            हम सामान्य पाठकों से कोई व्यक्तिगत पहचान योग्य जानकारी (जैसे आधार संख्या, बैंक विवरण अथवा पासवर्ड) कभी नहीं मांगते। किसी भी प्रकार की धोखाधड़ी से सावधान रहें।
          </p>
        </div>
      )
    },
    'terms-and-conditions': {
      title: 'नियम एवं शर्तें (Terms and Conditions)',
      subtitle: 'वेबसाइट उपयोग की वैधानिक शर्तें एवं नियम',
      content: (
        <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
          <p>
            इस वेबसाइट का उपयोग करके आप निम्नलिखित नियमों एवं शर्तों से पूरी तरह सहमत होते हैं:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-xs sm:text-sm">
            <li>MP Exam Update पर प्रकाशित सामग्री केवल सूचनात्मक एवं सामान्य मार्गदर्शन के उद्देश्य से है।</li>
            <li>हम सभी सूचनाओं की प्रामाणिकता सुनिश्चित करने का हर संभव प्रयास करते हैं, परंतु किसी भी त्रुटि या विसंगति के लिए संबंधित विभाग का आधिकारिक गजट/नोटिफिकेशन ही अंतिम रूप से मान्य होगा।</li>
            <li>हमारी वेबसाइट से किसी भी सामग्री को व्यावसायिक लाभ हेतु अनधिकृत रूप से कॉपी या स्क्रैप करना कानूनी अपराध है।</li>
            <li>वेबसाइट पर दिए गए बाहरी लिंक तीसरे पक्ष के हैं; उन पर उपलब्ध सामग्री या सुरक्षा के लिए MP Exam Update उत्तरदायी नहीं है।</li>
          </ul>
        </div>
      )
    },
    disclaimer: {
      title: 'अस्वीकरण (Legal Disclaimer)',
      subtitle: 'महत्वपूर्ण वैधानिक सूचना एवं स्पष्टीकरण',
      content: (
        <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              "यह जानकारी केवल सामान्य सूचना के उद्देश्य से दी गई है। आवेदन करने से पहले संबंधित विभाग की आधिकारिक वेबसाइट और आधिकारिक नोटिफिकेशन अवश्य देखें।"
            </p>
          </div>
          <p>
            mpexamupdate.in मध्य प्रदेश शासन, भारत सरकार, मध्य प्रदेश लोक सेवा आयोग (MPPSC), मध्य प्रदेश कर्मचारी चयन मंडल (MPESB) या किसी भी अन्य सरकारी निकाय से प्रत्यक्ष अथवा अप्रत्यक्ष रूप से संबद्ध नहीं है।
          </p>
          <p>
            हम किसी भी सरकारी सेवा में चयन कराने का दावा नहीं करते और न ही ऐसी किसी गतिविधि में लिप्त हैं। अभ्यर्थियों को दृढ़ता से सलाह दी जाती है कि वे अंतिम तिथि, पात्रता, शुल्क एवं रिक्तियों की संख्या की पुष्टि सदैव मूल विज्ञापन से करें।
          </p>
        </div>
      )
    },
    advertisement: {
      title: 'विज्ञापन नीति (Advertisement Policy)',
      subtitle: 'पारदर्शी एवं पाठक-हितैषी विज्ञापन नीति',
      content: (
        <div className="space-y-4 text-slate-800 text-sm leading-relaxed">
          <p>
            MP Exam Update पोर्टल के सुचारू संचालन और निरंतर सर्वर लागत को वहन करने के लिए हम स्वच्छ, सुरक्षित एवं प्रासंगिक विज्ञापन (जैसे Google AdSense एवं शैक्षणिक प्रायोजन) प्रदर्शित करते हैं।
          </p>
          <h4 className="font-bold text-slate-900">हमारी विज्ञापन प्रतिबद्धता:</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700 text-xs sm:text-sm">
            <li>हम किसी भी भ्रामक, अश्लील, सट्टेबाजी या छात्रों के हित के विरुद्ध विज्ञापनों को स्वीकार नहीं करते।</li>
            <li>सभी विज्ञापन स्थानों को स्पष्ट रूप से 'Advertisement' अथवा 'विज्ञापन' के रूप में चिह्नित किया गया है।</li>
            <li>विज्ञापन कभी भी वास्तविक शैक्षणिक सामग्री में बाधा उत्पन्न नहीं करते (कम से कम लेआउट शिफ्ट)।</li>
          </ul>
          <p className="pt-2">
            यदि आप अपनी कोचिंग संस्था, पुस्तक प्रकाशन अथवा शैक्षणिक सेवा का विज्ञापन हमारे पोर्टल पर देना चाहते हैं, तो कृपया हमें <strong>{settings.contactEmail}</strong> पर ईमेल करें।
          </p>
        </div>
      )
    }
  };

  const current = pageData[pageType];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6 animate-fade-in">
      <Breadcrumbs
        items={[{ label: current.title }]}
        onNavigate={onNavigate}
      />

      <article className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-xl sm:text-3xl font-black text-slate-900">
            {current.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {current.subtitle}
          </p>
        </div>

        {current.content}
      </article>
    </div>
  );
};
