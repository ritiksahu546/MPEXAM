import React, { useMemo } from 'react';
import { AdSlotConfig } from '../../types';
import { sanitizeAdCode } from '../../utils/adSanitizer';

interface Props {
  slot: AdSlotConfig | undefined;
  className?: string;
  showAdminPlaceholder?: boolean;
}

export const AdSlot: React.FC<Props> = ({ 
  slot, 
  className = '', 
  showAdminPlaceholder = false 
}) => {
  // If no slot configured or explicitly disabled, do not render
  if (!slot || slot.enabled === false || slot.isActive === false) {
    return null;
  }

  // Check date range if specified
  const now = new Date().toISOString().slice(0, 10);
  if (slot.startDate && slot.startDate > now) {
    return null;
  }
  if (slot.endDate && slot.endDate < now) {
    return null;
  }

  const rawCode = slot.adCode || slot.code || '';
  const sanitizedHtml = useMemo(() => sanitizeAdCode(rawCode), [rawCode]);
  const minHeight = slot.minHeight || (slot.format === '300x250' ? 250 : 90);

  // If real, safe ad code exists, render it cleanly with CLS prevention
  if (sanitizedHtml) {
    return (
      <aside 
        aria-label="प्रायोजित विज्ञापन"
        className={`w-full overflow-hidden my-3 flex flex-col justify-center items-center ${className}`}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 font-semibold">
          विज्ञापन • ADVERTISEMENT
        </div>
        <div 
          className="w-full flex justify-center items-center"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </aside>
    );
  }

  // If no code exists and showAdminPlaceholder is true, show preview box for admin only
  if (showAdminPlaceholder) {
    return (
      <aside 
        aria-label={`Advertisement placeholder: ${slot.label || slot.slotKey}`}
        className={`w-full my-3 px-3 py-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center flex flex-col items-center justify-center transition-all ${className}`}
        style={{ minHeight: `${minHeight}px` }}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-600 uppercase mb-1">
          <span>विज्ञापन स्थान (Admin Preview)</span>
        </div>
        <div className="text-xs text-slate-600 font-medium">
          {slot.label || slot.slotKey} ({slot.provider || 'AdSense'})
        </div>
      </aside>
    );
  }

  // For regular public visitors, if no ad code is configured, return null (NO placeholder box!)
  return null;
};
