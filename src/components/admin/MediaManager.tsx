import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, FileText, Upload, Copy, Check, Trash2, AlertCircle, Loader2, Cloud, RefreshCw } from 'lucide-react';
import { uploadMediaFileToStorage, deleteMediaFromStorage, isFirebaseConfigured } from '../../services/firebase';
import { getMediaLibrary, saveMediaLibrary, MediaLibraryItem } from '../../services/storage';

export const MediaManager: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load media items from Firestore on mount
  const loadMedia = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const items = await getMediaLibrary();
      setMediaList(items);
    } catch (err: any) {
      console.error('Failed to load media library:', err);
      setErrorMsg('मीडिया लाइब्रेरी लोड करने में त्रुटि: ' + (err.message || 'नेटवर्क समस्या'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);

    try {
      const result = await uploadMediaFileToStorage(file, 'media_library');

      const newItem: MediaLibraryItem = {
        id: 'media_' + Date.now(),
        url: result.url,
        storagePath: result.storagePath,
        name: result.name,
        type: result.type,
        uploadedAt: new Date().toLocaleDateString('hi-IN')
      };

      const updated = [newItem, ...mediaList];
      setMediaList(updated);
      await saveMediaLibrary(updated);
    } catch (err: any) {
      console.error('Media upload failed:', err);
      setErrorMsg(err.message || 'फाइल अपलोड करने में विफल।');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleCopy = (item: MediaLibraryItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: MediaLibraryItem) => {
    if (!confirm(`क्या आप निश्चित रूप से "${item.name}" को लाइब्रेरी और स्टोरेज से स्थायी रूप से हटाना चाहते हैं?`)) {
      return;
    }

    setDeletingId(item.id);
    setErrorMsg('');

    try {
      // 1. Delete object from Firebase Storage if configured and target is on Storage
      if (isFirebaseConfigured && (item.storagePath || item.url.includes('firebasestorage.googleapis.com'))) {
        try {
          await deleteMediaFromStorage(item.storagePath || item.url);
        } catch (storageErr: any) {
          console.error('Storage object deletion error:', storageErr);
          throw new Error('Firebase Storage से ऑब्जेक्ट हटाने में त्रुटि: ' + (storageErr.message || ''));
        }
      }

      // 2. Remove metadata from Firestore & local state
      const updated = mediaList.filter(m => m.id !== item.id);
      setMediaList(updated);
      await saveMediaLibrary(updated);
    } catch (err: any) {
      console.error('Media delete failed:', err);
      setErrorMsg(err.message || 'मीडिया हटाने में विफल।');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-700" />
              <span>मीडिया लाइब्रेरी (Media & Storage)</span>
            </h2>
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Cloud className="w-3 h-3" />
                Firestore सिंक
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                लोकल मोड
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            क्लाउड-समर्थित मीडिया लाइब्रेरी (Firestore मेटाडेटा + Firebase Storage स्थायी स्टोरेज)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadMedia}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <label className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? 'अपलोड हो रहा है...' : 'नई फाइल अपलोड करें'}</span>
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={isUploading || isLoading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-xs font-medium text-slate-500">मीडिया लाइब्रेरी लोड हो रही है...</p>
        </div>
      ) : (
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
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{item.uploadedAt}</span>
                  {item.storagePath && (
                    <span className="text-blue-600 font-medium truncate max-w-[120px]" title={item.storagePath}>
                      क्लाउड ऑब्जेक्ट
                    </span>
                  )}
                </div>

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
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                    title="स्थायी रूप से हटाएं"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {mediaList.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              कोई मीडिया फाइल नहीं मिली। "नई फाइल अपलोड करें" पर क्लिक करके शुरुआत करें।
            </div>
          )}
        </div>
      )}
    </div>
  );
};
