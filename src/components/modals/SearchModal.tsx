import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowRight, Building, Sparkles, AlertCircle } from 'lucide-react';
import { Post } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onSelectPost: (slug: string) => void;
}

const RECENT_SEARCHES_KEY = 'mp_exam_recent_searches_v1';

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  posts,
  onSelectPost
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {}
      }
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const trimmed = term.trim();
    const updated = [trimmed, ...recentSearches.filter(t => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSelect = (slug: string, termToSave?: string) => {
    if (termToSave) saveSearchTerm(termToSave);
    onClose();
    onSelectPost(slug);
  };

  const filteredPosts = query.trim() === '' ? [] : posts.filter(post => {
    const q = query.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.titleHindi.toLowerCase().includes(q) ||
      post.organization.toLowerCase().includes(q) ||
      post.categoryName.toLowerCase().includes(q) ||
      (post.focusKeyword && post.focusKeyword.toLowerCase().includes(q)) ||
      (post.qualification && post.qualification.toLowerCase().includes(q)) ||
      (post.secondaryKeywords && post.secondaryKeywords.toLowerCase().includes(q))
    );
  });

  const suggestions = [
    'MP Police Constable',
    'MPPSC 2026',
    'व्यापम सहायक ग्रेड 3',
    'पटवारी भर्ती',
    'प्राथमिक शिक्षक पात्रता TET',
    'वनरक्षक रिजल्ट'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden mt-6 sm:mt-12 animate-in fade-in duration-150">
        
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredPosts.length > 0) {
                handleSelect(filteredPosts[0].slug, query);
              }
            }}
            placeholder="भर्ती, परीक्षा, विभाग, MPPSC, व्यापम या पद का नाम खोजें..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-600 text-sm sm:text-base outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-200/70 hover:bg-slate-200 rounded-lg"
          >
            बंद करें (Esc)
          </button>
        </div>

        {/* Search Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="space-y-5">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      हाल ही में की गई खोज (Recent Searches)
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-slate-600 hover:text-red-700 hover:underline"
                    >
                      हटाएं
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-3 py-1 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggested Searches */}
              <div>
                <div className="text-xs text-slate-600 font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  लोकप्रिय सर्च सुझाव (Popular Searches)
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(s)}
                      className="text-xs bg-blue-50/70 hover:bg-blue-100 text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-150 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-600">
                मध्य प्रदेश की सभी भर्तियों, एडमिट कार्ड व नतीजों को खोजें
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-3">
                <span>सर्च परिणाम: <strong>{filteredPosts.length}</strong> पोस्ट मिले</span>
                <span className="text-[11px] text-slate-600">"{query}" के लिए</span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">कोई परिणाम नहीं मिला</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    कृपया अन्य कीवर्ड, विभाग का नाम (जैसे MPPSC, MP Police, Vyapam) या सामान्य नाम से पुनः प्रयास करें।
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleSelect(post.slug, query)}
                      className="py-3 px-2 hover:bg-blue-50/50 rounded-lg cursor-pointer transition-colors group flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {post.categoryName}
                          </span>
                          <span className="text-xs text-slate-600 flex items-center gap-1 truncate">
                            <Building className="w-3 h-3 text-slate-600" />
                            <span className="truncate">{post.organization}</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 leading-snug line-clamp-2">
                          {post.titleHindi || post.title}
                        </h4>
                        {post.applicationLastDate && (
                          <div className="text-[11px] text-red-600 mt-1 font-medium">
                            अंतिम तिथि: {post.applicationLastDate}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
