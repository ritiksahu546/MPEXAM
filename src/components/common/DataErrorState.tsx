import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  message?: string;
  onRetry: () => void;
}

export const DataErrorState: React.FC<Props> = ({ 
  message = 'डेटा लोड करने में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
  onRetry 
}) => {
  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        डेटा लोड नहीं हो पाया (Unable to Load Data)
      </h3>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        <span>पुनः प्रयास करें (Refresh / Retry)</span>
      </button>
    </div>
  );
};
