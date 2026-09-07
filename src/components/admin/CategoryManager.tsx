import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  ExternalLink, 
  Check, 
  X, 
  Save,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Category } from '../../types';

interface Props {
  categories: Category[];
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onViewCategory?: (slug: string) => void;
}

export const CategoryManager: React.FC<Props> = ({
  categories,
  onSaveCategory,
  onDeleteCategory,
  onViewCategory
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const createBlankCategory = (): Category => {
    return {
      id: 'cat_' + Date.now(),
      nameHindi: '',
      nameEnglish: '',
      slug: '',
      description: '',
      image: '',
      seoTitle: '',
      seoDescription: '',
      order: categories.length + 1,
      icon: 'Briefcase'
    };
  };

  const handleStartCreate = () => {
    setEditingCategory(createBlankCategory());
    setIsCreatingNew(true);
    setError('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsCreatingNew(false);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    if (!editingCategory.nameHindi.trim() || !editingCategory.slug.trim()) {
      setError('कृपया श्रेणी का हिंदी नाम और URL Slug दर्ज करें।');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const sanitized: Category = {
        ...editingCategory,
        nameEnglish: editingCategory.nameEnglish || editingCategory.nameHindi,
        slug: editingCategory.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      };
      await onSaveCategory(sanitized);
      setEditingCategory(null);
      setIsCreatingNew(false);
    } catch (err: any) {
      setError(err.message || 'श्रेणी सहेजने में त्रुटि हुई।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`क्या आप निश्चित रूप से श्रेणी "${cat.nameHindi}" को हटाना चाहते हैं?`)) {
      try {
        await onDeleteCategory(cat.id);
      } catch (err: any) {
        alert('हटाने में त्रुटि: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <span>श्रेणी प्रबंधन (Category Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            प्रत्येक श्रेणी का अपना समर्पित पेज होता है (उदा. /category/mppsc, /category/mp-police)
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नई श्रेणी जोड़ें</span>
        </button>
      </div>

      {/* Editor Form Modal or Inline */}
      {editingCategory && (
        <form onSubmit={handleSave} className="bg-slate-50 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-800">
              {isCreatingNew ? 'नई श्रेणी बनाएं (Add Category)' : `श्रेणी संपादित करें: ${editingCategory.nameHindi}`}
            </h3>
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                हिंदी नाम (Hindi Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingCategory.nameHindi}
                onChange={e => setEditingCategory({ 
                  ...editingCategory, 
                  nameHindi: e.target.value,
                  slug: editingCategory.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                })}
                placeholder="एमपी पुलिस भर्ती"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अंग्रेजी नाम (English Name)
              </label>
              <input
                type="text"
                value={editingCategory.nameEnglish || ''}
                onChange={e => setEditingCategory({ ...editingCategory, nameEnglish: e.target.value })}
                placeholder="MP Police"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Slug (/category/slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingCategory.slug}
                onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="mp-police"
                className="w-full px-3 py-2 bg-white font-mono border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                श्रेणी विवरण (Description)
              </label>
              <textarea
                rows={2}
                value={editingCategory.description || ''}
                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                placeholder="मध्य प्रदेश पुलिस विभाग के समस्त पद, भर्ती नियम एवं नवीनतम विज्ञप्तियां..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                श्रेणी बैनर/आइकन URL (Image URL)
              </label>
              <input
                type="url"
                value={editingCategory.image || ''}
                onChange={e => setEditingCategory({ ...editingCategory, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">प्रदर्शन क्रम (Order):</label>
                <input
                  type="number"
                  value={editingCategory.order || 1}
                  onChange={e => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value, 10) || 1 })}
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SEO टाइटल (SEO Meta Title)
              </label>
              <input
                type="text"
                value={editingCategory.seoTitle || ''}
                onChange={e => setEditingCategory({ ...editingCategory, seoTitle: e.target.value })}
                placeholder={`${editingCategory.nameHindi || 'श्रेणी'} भर्ती 2026 - MP Exam Update`}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SEO विवरण (SEO Meta Description)
              </label>
              <input
                type="text"
                value={editingCategory.seoDescription || ''}
                onChange={e => setEditingCategory({ ...editingCategory, seoDescription: e.target.value })}
                placeholder={editingCategory.description || 'मध्य प्रदेश भर्ती अपडेट'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
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
              <span>{isSaving ? 'सहेज रहे हैं...' : 'श्रेणी सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">श्रेणी नाम (Hindi / English)</th>
                <th className="p-3">URL Slug</th>
                <th className="p-3 hidden md:table-cell">विवरण</th>
                <th className="p-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-400">
                    {cat.order || idx + 1}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{cat.nameHindi}</div>
                    <div className="text-[11px] text-slate-500">{cat.nameEnglish}</div>
                  </td>
                  <td className="p-3">
                    <code className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px]">
                      /category/{cat.slug}
                    </code>
                  </td>
                  <td className="p-3 hidden md:table-cell text-slate-600 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {onViewCategory && (
                        <button
                          type="button"
                          onClick={() => onViewCategory(cat.slug)}
                          title="पेज देखें"
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        title="संपादित करें"
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        title="हटाएं"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    कोई श्रेणी उपलब्ध नहीं है। "नई श्रेणी जोड़ें" पर क्लिक करें।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
