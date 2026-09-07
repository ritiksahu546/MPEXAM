import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  className?: string;
}

export const Disclaimer: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`p-4 bg-amber-50/90 border border-amber-200 rounded-lg text-amber-900 text-sm flex items-start gap-3 shadow-xs ${className}`}>
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-bold block text-amber-950 mb-0.5">महत्वपूर्ण सूचना एवं डिस्क्लेमर (Disclaimer):</span>
        <p className="text-xs sm:text-sm text-amber-900">
          यह जानकारी केवल सामान्य सूचना के उद्देश्य से दी गई है। आवेदन करने से पहले संबंधित विभाग की आधिकारिक वेबसाइट और आधिकारिक नोटिफिकेशन अवश्य देखें। किसी भी प्रकार की त्रुटि के लिए संबंधित विभाग का आधिकारिक विज्ञापन ही अंतिम माना जाएगा।
        </p>
      </div>
    </div>
  );
};
