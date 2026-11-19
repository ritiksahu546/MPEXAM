import React, { useState, useEffect } from 'react';
import { Post, Category, AdSlotConfig } from '../../types';
import { JobCard } from '../cards/JobCard';
import { AdSlot } from '../common/AdSlot';
import { SEOHead } from '../common/SEOHead';
import { Bookmark, Trash2, ArrowRight, Briefcase, Search, Sparkles } from 'lucide-react';
import { getSavedJobIds, clearAllSavedJobs, BOOKMARKS_EVENT } from '../../utils/bookmarks';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

export const SavedJobsView: React.FC<Props> = ({
  posts,
  categories,
  adSlots,
  onNavigate,
  onSelectPost
}) => {
  const [savedIds, setSavedIds] = useState<string[]>(() => getSavedJobIds());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedIds(getSavedJobIds());
    };

    window.addEventListener(BOOKMARKS_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKMARKS_EVENT, handleUpdate);
  }, []);

  // Filter posts that match any saved ID or Slug
  const savedPosts = posts.filter(post => {
    const id = post.id?.trim().toLowerCase();
    const slug = post.slug?.trim().toLowerCase();
    return savedIds.some(saved => {
      const clean = saved.trim().toLowerCase();
      return (id && clean === id) || (slug && clean === slug);
    });
  });

  const handleClearAll = () => {
    if (window.confirm('क्या आप सभी सुरक्षित की गई नौकरियों को सूची से हटाना चाहते हैं?')) {
      clearAllSavedJobs();
      setSavedIds([]);
    }
  };

  const getAd = (slotKey: string) => adSlots.find(s => s.slotKey === slotKey && s.active);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-4">
      <SEOHead
        title="मेरी सुरक्षित नौकरियां एवं परीक्षा अपडेट (Saved Jobs)"
        description="आपके द्वारा बुकमार्क की गई सभी मध्य प्रदेश सरकारी भर्तियां, एडमिट कार्ड एवं परीक्षा अपडेट।"
        canonicalUrl="https://mpexamupdates.in/saved-jobs"
        noindex={true}
      />

      {/* Top Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-blue-700 hover:underline cursor-pointer"
        >
          होम
        </button>
        <span>/</span>
        <span className="font-semibold text-slate-800">सुरक्षित नौकरियां (Saved Jobs)</span>
      </nav>

      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Bookmark className="w-6 h-6 text-amber-600 fill-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                सुरक्षित नौकरियां एवं अपडेट
              </h1>
              <span className="bg-amber-100 text-amber-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
                {savedPosts.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              आपके द्वारा बुकमार्क की गई सभी महत्वपूर्ण सरकारी भर्तियां और आगामी परीक्षाएं
            </p>
          </div>
        </div>

        {savedPosts.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>सभी हटाएं (Clear All)</span>
          </button>
        )}
      </div>

      {/* Top Content Ad */}
      <AdSlot slot={getAd('top_content_ad') || getAd('header_ad')} />

      {/* Content Section */}
      {savedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {savedPosts.map(post => (
            <JobCard
              key={post.id}
              post={post}
              onSelect={onSelectPost}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              कोई सुरक्षित नौकरी नहीं मिली
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5">
              आपने अभी तक किसी भर्ती या परीक्षा को सेव नहीं किया है। किसी भी कार्ड या पोस्ट विवरण पर दिए गए बुकमार्क आइकन पर क्लिक कर आप उसे बाद में पढ़ने के लिए सुरक्षित कर सकते हैं।
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('jobs')}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>नवीनतम नौकरियां देखें</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admit-cards')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>एडमिट कार्ड देखें</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Ad */}
      <AdSlot slot={getAd('footer_ad') || getAd('between_posts')} />
    </div>
  );
};
