import React, { useState } from 'react';
import { Image as ImageIcon, FileText, Upload, Copy, Check, Trash2, AlertCircle } from 'lucide-react';
import { uploadImageToStorage, uploadPdfToStorage, isFirebaseConfigured } from '../../services/firebase';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'pdf';
  uploadedAt: string;
}

const LOCAL_MEDIA_KEY = 'mp_exam_media_library_v1';

export const MediaManager: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_MEDIA_KEY);
    return stored ? JSON.parse(stored) : [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
        name: 'mp_police_banner.jpg',
        type: 'image',
        uploadedAt: new Date().toLocaleDateString('hi-IN')
      },
      {
        id: 'm2',
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
        name: 'mppsc_library.jpg',
        type: 'image',
        uploadedAt: new Date().toLocaleDateString('hi-IN')
      }
    ];
  });

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const saveMedia = (items: MediaItem[]) => {
    setMediaList(items);
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(items));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);

    try {
      let url = '';
      let type: 'image' | 'pdf' = 'image';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        type = 'pdf';
        url = await uploadPdfToStorage(file, 'media_library');
      } else if (file.type.startsWith('image/')) {
        type = 'image';
        url = await uploadImageToStorage(file, 'media_library');
      } else {
        throw new Error('कृपया केवल इमेज (JPG, PNG, WebP) अथवा PDF फाइल अपलोड करें।');
      }

      const newItem: MediaItem = {
        id: 'media_' + Date.now(),
        url,
        name: file.name,
        type,
        uploadedAt: new Date().toLocaleDateString('hi-IN')
      };

      saveMedia([newItem, ...mediaList]);
    } catch (err: any) {
      console.error('Media upload failed:', err);
      setErrorMsg(err.message || 'फाइल अपलोड करने में विफल।');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('क्या आप निश्चित रूप से इस मीडिया फाइल को लाइब्रेरी से हटाना चाहते हैं?')) {
      saveMedia(mediaList.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-700" />
            <span>मीडिया लाइब्रेरी (Media & Storage)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Firebase Storage पर आधिकारिक PDF अधिसूचनाएं एवं इमेजेस अपलोड करें व लिंक कॉपी करें
          </p>
        </div>

        <label className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'अपलोड हो रहा है...' : 'नई फाइल अपलोड करें'}</span>
          <input
            type="file"
            accept="image/*,.pdf,application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of uploaded assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaList.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            {item.type === 'image' ? (
              <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="h-36 bg-emerald-50 flex flex-col items-center justify-center text-emerald-700 p-3 text-center">
                <FileText className="w-10 h-10 mb-1" />
                <span className="text-[11px] font-bold">PDF अधिसूचना</span>
              </div>
            )}

            <div className="p-3">
              <p className="font-bold text-xs text-slate-800 truncate" title={item.name}>
                {item.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {item.uploadedAt}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy(item)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">कॉपी हुआ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>URL कॉपी</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {mediaList.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            कोई मीडिया फाइल नहीं मिली। "नई फाइल अपलोड करें" पर क्लिक करें।
          </div>
        )}
      </div>
    </div>
  );
};
