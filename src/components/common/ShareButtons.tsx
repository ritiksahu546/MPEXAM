import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Send } from 'lucide-react';

interface Props {
  title: string;
  url: string;
}

export const ShareButtons: React.FC<Props> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/#${url}` : url;
  const shareText = encodeURIComponent(`${title}\nपूरी जानकारी यहाँ देखें:\n${fullUrl}`);
  const encodedUrl = encodeURIComponent(fullUrl);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${title} - ${fullUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: title,
        url: fullUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Share2 className="w-4 h-4 text-blue-600" />
          <span>इस भर्ती को दोस्तों के साथ शेयर करें:</span>
        </div>
        {copied && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" /> लिंक कॉपी हो गया!
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <a
          href={`https://api.whatsapp.com/send?text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${shareText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors shadow-xs"
        >
          <span className="font-bold">f</span>
          <span>Facebook</span>
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors border border-slate-200"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
          <span>{copied ? 'कॉपी हुआ' : 'कॉपी लिंक'}</span>
        </button>
      </div>
    </div>
  );
};
