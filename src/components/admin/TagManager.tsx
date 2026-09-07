import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { Tag } from '../../types';

interface Props {
  tags: Tag[];
  onSaveTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

export const TagManager: React.FC<Props> = ({ tags, onSaveTag, onDeleteTag }) => {
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleStartCreate = () => {
    setEditingTag({
      id: 'tag_' + Date.now(),
      name: '',
      slug: '',
      postCount: 0
    });
    setTagName('');
    setTagSlug('');
    setError('');
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagSlug(tag.slug);
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      setError('कृपया टैग का नाम दर्ज करें।');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const slug = tagSlug.trim() || tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const sanitized: Tag = {
        id: editingTag?.id || 'tag_' + Date.now(),
        name: tagName.trim(),
        slug,
        postCount: editingTag?.postCount || 0
      };
      await onSaveTag(sanitized);
      setEditingTag(null);
    } catch (err: any) {
      setError(err.message || 'टैग सहेजने में विफल।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (confirm(`क्या आप टैग "${tag.name}" हटाना चाहते हैं?`)) {
      try {
        await onDeleteTag(tag.id);
      } catch (err: any) {
        alert('हटाने में त्रुटि: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-blue-700" />
            <span>टैग प्रबंधन (Tags Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            विज्ञप्तियों को तेजी से फ़िल्टर व सर्च करने हेतु उपयोगी टैग्स
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नया टैग जोड़ें</span>
        </button>
      </div>

      {editingTag && (
        <form onSubmit={handleSave} className="bg-slate-50 border border-blue-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-800">
              टैग विवरण (Tag Details)
            </h3>
            <button
              type="button"
              onClick={() => setEditingTag(null)}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-2 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">टैग नाम (Tag Name) *</label>
              <input
                type="text"
                required
                value={tagName}
                onChange={e => {
                  setTagName(e.target.value);
                  if (!tagSlug) {
                    setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                  }
                }}
                placeholder="उदा. MP Police 2026"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={tagSlug}
                onChange={e => setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="mp-police-2026"
                className="w-full px-3 py-2 bg-white font-mono border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditingTag(null)}
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
              <span>{isSaving ? 'सहेज रहे हैं...' : 'टैग सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tags Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-wrap gap-2.5">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl text-xs text-slate-800 group transition-all"
            >
              <span className="font-bold">#{tag.name}</span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">
                {tag.slug}
              </span>
              <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleStartEdit(tag)}
                  className="text-slate-400 hover:text-amber-600 p-0.5"
                  title="संपादित करें"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  className="text-slate-400 hover:text-red-600 p-0.5"
                  title="हटाएं"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-xs text-slate-400 py-4">कोई टैग उपलब्ध नहीं है।</p>
          )}
        </div>
      </div>
    </div>
  );
};
