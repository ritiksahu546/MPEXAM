import React from 'react';
import { AdSlotConfig } from '../../types';

interface Props {
  slot: AdSlotConfig | undefined;
  className?: string;
}

export const AdSlot: React.FC<Props> = ({ slot, className = '' }) => {
  if (!slot || !slot.enabled) {
    return null;
  }

  // If custom script / AdSense code exists, inject it safely, otherwise show clean compliant placeholder
  if (slot.adCode && slot.adCode.trim() !== '') {
    return (
      <div 
        className={`w-full overflow-hidden my-3 flex justify-center items-center ${className}`}
        style={{ minHeight: `${slot.minHeight}px` }}
        dangerouslySetInnerHTML={{ __html: slot.adCode }}
      />
    );
  }

  return (
    <aside 
      aria-label={`Advertisement slot: ${slot.label}`}
      className={`w-full my-3 px-3 py-3 border border-dashed border-slate-300 rounded-lg bg-slate-100/70 text-center flex flex-col items-center justify-center transition-all ${className}`}
      style={{ minHeight: `${slot.minHeight}px` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase mb-1">
        <span>विज्ञापन</span>
        <span>•</span>
        <span>ADVERTISEMENT</span>
      </div>
      <div className="text-xs text-slate-600 font-medium max-w-md">
        <span>{slot.label}</span>
      </div>
      <div className="text-[10px] text-slate-600 mt-0.5">
        Google AdSense / प्रायोजित विज्ञापन स्थान (Admin से सक्रिय/निष्क्रिय करें)
      </div>
    </aside>
  );
};
