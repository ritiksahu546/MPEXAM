import React from 'react';
import { Post, Category, AdSlotConfig, ImportantLink, SiteSettings } from '../../types';
import { QuickTableCard } from '../cards/QuickTableCard';
import { JobCard } from '../cards/JobCard';
import { CategoryPill } from '../cards/CategoryPill';
import { AdSlot } from '../common/AdSlot';
import { 
  Sparkles, 
  Flame, 
  ExternalLink, 
  ChevronRight, 
  Award, 
  Shield, 
  GraduationCap, 
  FileText,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  importantLinks: ImportantLink[];
  settings: SiteSettings;
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

export const HomeView: React.FC<Props> = ({
  posts,
  categories,
  adSlots,
  importantLinks,
  settings,
  onNavigate,
  onSelectPost
}) => {
  // Categorize posts
  const publishedPosts = posts.filter(p => p.status === 'published');
  
  const latestJobs = publishedPosts.filter(p => p.postType === 'job');
  const latestAdmitCards = publishedPosts.filter(p => p.postType === 'admit_card');
  const latestResults = publishedPosts.filter(p => p.postType === 'result');
  const latestAnswerKeys = publishedPosts.filter(p => p.postType === 'answer_key');
  const featuredPosts = publishedPosts.filter(p => p.featured);
  const mppscPosts = publishedPosts.filter(p => p.categoryId === 'mppsc' || p.organization.includes('MPPSC'));
  const mpesbPosts = publishedPosts.filter(p => p.categoryId === 'mpesb' || p.organization.includes('MPESB') || p.organization.includes('व्यापम'));
  const policePosts = publishedPosts.filter(p => p.categoryId === 'mp-police' || p.organization.includes('पुलिस'));
  const teacherPosts = publishedPosts.filter(p => p.categoryId === 'teacher-jobs' || p.organization.includes('शिक्षक'));

  const getAd = (key: string) => adSlots.find(a => a.slotKey === key);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner Ad Slot */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('header_ad')} />
      </div>

      {/* Hero Quick Navigation Chips */}
      <section aria-label="Category Quick Links" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>सीधा प्रवेश श्रेणियां (Quick Categories):</span>
            </span>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-0.5"
            >
              <span>सभी 15 श्रेणियां</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.slice(0, 10).map((cat) => (
              <CategoryPill
                key={cat.id}
                category={cat}
                onClick={(slug) => onNavigate(`category/${slug}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4-Box Matrix (Sarkari Result / Jagran style Quick Blocks) */}
      <section aria-label="Quick Updates Matrix" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-blue-700 rounded-xs"></div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              त्वरित परीक्षा पोर्टल अपडेट (Quick Updates)
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline-block">
            आज की सबसे ताज़ा जानकारियां
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickTableCard
            title="नवीनतम सरकारी नौकरी"
            titleEn="Latest Jobs"
            posts={latestJobs}
            accentColor="blue"
            onSelectPost={onSelectPost}
            onViewAll={() => onNavigate('jobs')}
          />
          <QuickTableCard
            title="एडमिट कार्ड"
            titleEn="Admit Card"
            posts={latestAdmitCards}
            accentColor="amber"
            onSelectPost={onSelectPost}
            onViewAll={() => onNavigate('admit-cards')}
          />
          <QuickTableCard
            title="परीक्षा परिणाम"
            titleEn="Results"
            posts={latestResults}
            accentColor="emerald"
            onSelectPost={onSelectPost}
            onViewAll={() => onNavigate('results')}
          />
          <QuickTableCard
            title="आंसर की"
            titleEn="Answer Key"
            posts={latestAnswerKeys}
            accentColor="purple"
            onSelectPost={onSelectPost}
            onViewAll={() => onNavigate('answer-keys')}
          />
        </div>
      </section>

      {/* Top Content Ad */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('top_content_ad')} />
      </div>

      {/* Trending & Featured Job Alerts */}
      <section aria-label="Trending Job Alerts" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              ट्रेंडिंग भर्तियां 2026 (Trending MP Jobs)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <span>सभी भर्तियां देखें</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featuredPosts.slice(0, 6).map((post) => (
            <JobCard
              key={post.id}
              post={post}
              onSelect={onSelectPost}
            />
          ))}
        </div>
      </section>

      {/* Department-wise Sections: MPPSC, MPESB, Police, Teacher */}
      <section aria-label="Department Wise Updates" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* MPPSC Updates Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">MPPSC भर्ती एवं परीक्षा अपडेट</h3>
                  <p className="text-xs text-slate-600">लोक सेवा आयोग इंदौर द्वारा जारी विज्ञप्तियां</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('category/mppsc')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                सभी देखें
              </button>
            </div>

            <div className="space-y-3">
              {mppscPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="p-3 rounded-xl border border-slate-150 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 leading-snug line-clamp-2">
                      {post.titleHindi || post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                      <span>पद: {post.vacancy || 'विवरण देखें'}</span>
                      {post.applicationLastDate && (
                        <span className="text-red-600 font-medium">अंतिम तिथि: {post.applicationLastDate}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* MPESB (Vyapam) Updates Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">MPESB (व्यापम) परीक्षा अपडेट</h3>
                  <p className="text-xs text-slate-600">कर्मचारी चयन मंडल भोपाल की परीक्षाएं</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('category/mpesb')}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                सभी देखें
              </button>
            </div>

            <div className="space-y-3">
              {mpesbPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="p-3 rounded-xl border border-slate-150 hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-800 leading-snug line-clamp-2">
                      {post.titleHindi || post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                      <span>पद: {post.vacancy || 'विवरण देखें'}</span>
                      {post.applicationLastDate && (
                        <span className="text-red-600 font-medium">अंतिम तिथि: {post.applicationLastDate}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Police & Teacher Jobs Highlights */}
      <section aria-label="Police and Teacher Recruitment" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* MP Police Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-base text-slate-900">मध्य प्रदेश पुलिस भर्ती (MP Police)</h3>
              </div>
              <button
                onClick={() => onNavigate('category/mp-police')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                और देखें
              </button>
            </div>
            <div className="space-y-2.5">
              {policePosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer transition-colors"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-700">
                    {post.titleHindi || post.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{post.qualification} • {post.vacancy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Recruitment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-base text-slate-900">शिक्षक भर्ती एवं पात्रता परीक्षा (TET)</h3>
              </div>
              <button
                onClick={() => onNavigate('category/teacher-jobs')}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                और देखें
              </button>
            </div>
            <div className="space-y-2.5">
              {teacherPosts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.slug)}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-purple-50/50 border border-slate-200 cursor-pointer transition-colors"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 hover:text-purple-700">
                    {post.titleHindi || post.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{post.qualification} • {post.vacancy}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Important Links Box */}
      <section aria-label="Official Government Portals" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-amber-400" />
                <span>महत्वपूर्ण शासकीय लिंक (Important Official Links)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                मध्य प्रदेश सरकार के अधिकृत पोर्टल, आवेदन व पंजीयन वेबसाइट
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {importantLinks.filter(l => l.active).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-between gap-2 group"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                    {link.titleHindi || link.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {link.url}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <span>{link.buttonLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Ad */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('footer_ad')} />
      </div>

    </div>
  );
};
