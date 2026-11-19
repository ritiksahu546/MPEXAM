import React, { useState } from 'react';
import { Post, Category } from '../../types';
import { SEOHead } from '../common/SEOHead';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Search, Home, Briefcase, FileText, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

interface Props {
  posts: Post[];
  categories: Category[];
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

export const NotFoundView: React.FC<Props> = ({
  posts,
  categories,
  onNavigate,
  onSelectPost
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm.trim())}`);
      onNavigate('search');
    }
  };

  const latestPosts = posts
    .filter(p => p.status === 'published')
    .slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 space-y-8 animate-fade-in">
      <SEOHead
        title="404 - पृष्ठ नहीं मिला (Page Not Found) | MP Exam Update"
        description="क्षमा करें, आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है या हटा दिया गया है। नवीनतम एमपी सरकारी नौकरी एवं परीक्षा अपडेट देखें।"
        canonicalUrl="https://mpexamupdates.in/404"
        noindex={true}
      />

      <Breadcrumbs
        items={[{ label: '404 पृष्ठ नहीं मिला' }]}
        onNavigate={onNavigate}
      />

      {/* Main 404 Alert Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
          त्रुटि कोड 404 (HTTP 404 Error)
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          पृष्ठ नहीं मिला (Page Not Found)
        </h1>

        <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
          आप जिस वेब पते (URL) को खोलने का प्रयास कर रहे हैं, वह संभवतः बदल दिया गया है, हटा दिया गया है या वर्तमान में उपलब्ध नहीं है।
        </p>

        {/* Search bar inside 404 */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="नौकरी या परीक्षा का नाम खोजें..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            खोजें
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>मुख्य पृष्ठ (होमपेज) पर जाएं</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('jobs')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <Briefcase className="w-5 h-5 text-blue-700 mb-2 group-hover:scale-110 transition-transform" />
          <strong className="block text-xs sm:text-sm font-bold text-slate-900">नवीनतम नौकरियां</strong>
          <span className="text-2xs text-slate-500">सभी MP Govt Jobs</span>
        </button>

        <button
          onClick={() => onNavigate('admit-cards')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <FileText className="w-5 h-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
          <strong className="block text-xs sm:text-sm font-bold text-slate-900">प्रवेश पत्र</strong>
          <span className="text-2xs text-slate-500">Admit Card डाउनलोड</span>
        </button>

        <button
          onClick={() => onNavigate('results')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <CheckCircle className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
          <strong className="block text-xs sm:text-sm font-bold text-slate-900">परीक्षा परिणाम</strong>
          <span className="text-2xs text-slate-500">Sarkari Results</span>
        </button>

        <button
          onClick={() => onNavigate('categories')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all cursor-pointer group shadow-2xs"
        >
          <ArrowRight className="w-5 h-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
          <strong className="block text-xs sm:text-sm font-bold text-slate-900">समस्त श्रेणियां</strong>
          <span className="text-2xs text-slate-500">MPPSC, MPESB, Police</span>
        </button>
      </div>

      {/* Latest Updates Section */}
      {latestPosts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              हाल ही में जारी महत्वपूर्ण भर्ती एवं परीक्षाएं
            </h2>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              सभी देखें &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {latestPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post.slug || post.id)}
                className="p-3 rounded-xl border border-slate-150 hover:border-blue-400 bg-slate-50 hover:bg-white cursor-pointer transition-all flex flex-col justify-between"
              >
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-700">
                  {post.titleHindi || post.title}
                </h3>
                <div className="flex items-center justify-between text-2xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span>{post.organization}</span>
                  {post.applicationLastDate && (
                    <span className="text-red-600 font-semibold">
                      अंतिम तिथि: {post.applicationLastDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
