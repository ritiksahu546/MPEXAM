import React, { useState } from 'react';
import { Megaphone, Save, Check, X, AlertCircle, HelpCircle, Code, Calendar } from 'lucide-react';
import { AdSlotConfig, AdSlotLocation } from '../../types';

interface Props {
  adSlots: AdSlotConfig[];
  onSaveAdSlot: (slot: AdSlotConfig) => Promise<void>;
}

const ALL_SLOTS: { key: AdSlotLocation; label: string; desc: string }[] = [
  { key: 'HEADER', label: 'शीर्ष हेडर विज्ञापन (HEADER)', desc: 'वेबसाइट के मुख्य हेडर के ठीक नीचे (728x90 या रिस्पॉन्सिव)' },
  { key: 'TOP_CONTENT', label: 'कंटेंट के ऊपर (TOP_CONTENT)', desc: 'होमपेज एवं कैटेगरी पेज पर मुख्य सामग्री से पहले' },
  { key: 'ARTICLE_BEFORE', label: 'आर्टिकल से पहले (ARTICLE_BEFORE)', desc: 'विज्ञप्ति विवरण तालिका से ठीक पहले' },
  { key: 'ARTICLE_MIDDLE', label: 'आर्टिकल के बीच में (ARTICLE_MIDDLE)', desc: 'शैक्षणिक योग्यता एवं महत्वपूर्ण तिथियों के मध्य' },
  { key: 'ARTICLE_AFTER', label: 'आर्टिकल के बाद (ARTICLE_AFTER)', desc: 'महत्वपूर्ण लिंक्स तालिका के ठीक पश्चात' },
  { key: 'SIDEBAR', label: 'साइडबार विज्ञापन (SIDEBAR)', desc: 'डेस्कटॉप स्क्रीन पर दायें साइडबार में (300x250 या 300x600)' },
  { key: 'BETWEEN_POSTS', label: 'पोस्ट्स के बीच (BETWEEN_POSTS)', desc: 'होमपेज टेबल और पोस्ट सूचियों के बीच' },
  { key: 'FOOTER', label: 'फुटर विज्ञापन (FOOTER)', desc: 'पेज के सबसे नीचे मुख्य फुटर से ठीक पहले' },
  { key: 'MOBILE_STICKY', label: 'मोबाइल स्टिकी (MOBILE_STICKY)', desc: 'मोबाइल स्क्रीन पर नीचे की ओर फिक्सड बार (320x50)' }
];

export const AdManager: React.FC<Props> = ({ adSlots, onSaveAdSlot }) => {
  const [editingSlot, setEditingSlot] = useState<AdSlotConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const getSlotConfig = (slotKey: AdSlotLocation): AdSlotConfig => {
    const existing = adSlots.find(s => s.slotKey === slotKey || s.slot === slotKey);
    if (existing) return existing;
    return {
      id: 'ad_' + slotKey.toLowerCase(),
      slotKey,
      slot: slotKey,
      name: `${slotKey} Ad Slot`,
      format: slotKey === 'SIDEBAR' ? '300x250' : 'responsive',
      isActive: false,
      enabled: false,
      code: '',
      provider: 'adsense'
    };
  };

  const handleEditSlot = (slotKey: AdSlotLocation) => {
    setEditingSlot({ ...getSlotConfig(slotKey) });
    setSuccessMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setIsSaving(true);
    try {
      const normalized: AdSlotConfig = {
        ...editingSlot,
        enabled: Boolean(editingSlot.enabled),
        isActive: Boolean(editingSlot.enabled)
      };
      await onSaveAdSlot(normalized);
      setSuccessMsg(`स्लॉट ${normalized.slotKey} सफलतापूर्वक अपडेट किया गया।`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingSlot(null);
    } catch (err: any) {
      alert('विज्ञापन स्लॉट सहेजने में त्रुटि: ' + err.message);
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
            <Megaphone className="w-5 h-5 text-blue-700" />
            <span>विज्ञापन प्रबंधन (Advertisements & AdSense Slots)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Google AdSense अथवा कस्टम बैनर विज्ञापनों को 9 पूर्व-निर्धारित स्लॉट्स में नियंत्रित करें।
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editing Drawer / Modal */}
      {editingSlot && (
        <form onSubmit={handleSave} className="bg-slate-50 border-2 border-blue-600 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                स्लॉट संपादित करें: <span className="text-blue-700">{editingSlot.slotKey}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {ALL_SLOTS.find(s => s.key === editingSlot.slotKey)?.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingSlot(null)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">विज्ञापन नाम (Ad Name)</label>
              <input
                type="text"
                value={editingSlot.name || ''}
                onChange={e => setEditingSlot({ ...editingSlot, name: e.target.value })}
                placeholder="Header Responsive Banner"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">प्रदाता (Ad Provider)</label>
              <select
                value={editingSlot.provider || 'adsense'}
                onChange={e => setEditingSlot({ ...editingSlot, provider: e.target.value as any })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="adsense">Google AdSense</option>
                <option value="custom">कस्टम HTML / इमेज बैनर</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(editingSlot.enabled)}
                  onChange={e => setEditingSlot({ ...editingSlot, enabled: e.target.checked, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>विज्ञापन सक्रिय रखें (Enable Ad Slot)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              विज्ञापन कोड (AdSense Code Snippet / Custom HTML)
            </label>
            <textarea
              rows={5}
              value={editingSlot.code || ''}
              onChange={e => setEditingSlot({ ...editingSlot, code: e.target.value })}
              placeholder={'<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-..." data-ad-slot="..." data-ad-format="auto"></ins>'}
              className="w-full p-3 bg-white font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              यदि कोड खाली है या अक्षम है, तो बिना रुकावट के एक साफ़ रिज़र्व्ड प्लेसहोल्डर सुरक्षित रहेगा ताकि लेआउट शिफ्ट (CLS) न हो।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">प्रारंभ तिथि (Start Date)</label>
              <input
                type="date"
                value={editingSlot.startDate || ''}
                onChange={e => setEditingSlot({ ...editingSlot, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">समाप्ति तिथि (End Date)</label>
              <input
                type="date"
                value={editingSlot.endDate || ''}
                onChange={e => setEditingSlot({ ...editingSlot, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingSlot(null)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेज रहे हैं...' : 'स्लॉट सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_SLOTS.map(({ key, label, desc }) => {
          const cfg = getSlotConfig(key);
          const isEnabled = Boolean(cfg.enabled || cfg.isActive);

          return (
            <div
              key={key}
              className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                isEnabled ? 'border-emerald-300 shadow-2xs' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-xs text-slate-900">{label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isEnabled ? 'सक्रिय (Active)' : 'निष्क्रिय (Off)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed min-h-[32px]">
                  {desc}
                </p>
                {cfg.code && (
                  <div className="mt-2 bg-slate-50 p-1.5 rounded-lg font-mono text-[10px] text-slate-600 truncate border border-slate-200">
                    {cfg.code.slice(0, 45)}...
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  slot: {key}
                </span>
                <button
                  type="button"
                  onClick={() => handleEditSlot(key)}
                  className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-bold transition-colors"
                >
                  कॉन्फ़िगर करें
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
