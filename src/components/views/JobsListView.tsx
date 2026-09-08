import React, { useState, useMemo } from 'react';
import { Post, Category, AdSlotConfig } from '../../types';
import { JobCard } from '../cards/JobCard';
import { AdSlot } from '../common/AdSlot';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { SEOHead } from '../common/SEOHead';
import { 
  Filter, 
  RotateCcw, 
  ArrowUpDown, 
  Search, 
  Building, 
  GraduationCap, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  initialCategorySlug?: string;
  initialPostType?: string;
  pageTitle?: string;
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const JobsListView: React.FC<Props> = ({
  posts,
  categories,
  adSlots,
  initialCategorySlug,
  initialPostType,
  pageTitle = 'मध्य प्रदेश सरकारी नौकरियां एवं परीक्षा अपडेट 2026',
  onNavigate,
  onSelectPost
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedType, setSelectedType] = useState<string>(initialPostType || 'all');
  const [selectedQualification, setSelectedQualification] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'closing_soon' | 'most_viewed'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
  }, [categories, selectedCategory]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catMatches = 
          post.categoryId === selectedCategory ||
          (activeCategoryObj && (
            post.categoryId === activeCategoryObj.id ||
            post.category === activeCategoryObj.nameHindi ||
            post.category === activeCategoryObj.nameEnglish
          ));
        if (!catMatches) return false;
      }
      // Type filter
      if (selectedType !== 'all' && post.postType !== selectedType) {
        return false;
      }
      // Qualification filter
      if (selectedQualification !== 'all') {
        const q = post.qualification.toLowerCase();
        if (selectedQualification === '10th' && !q.includes('10th') && !q.includes('10वीं')) return false;
        if (selectedQualification === '12th' && !q.includes('12th') && !q.includes('12वीं')) return false;
        if (selectedQualification === 'graduate' && !q.includes('graduat') && !q.includes('स्नातक')) return false;
      }
      // Text search
      if (searchFilter.trim() !== '') {
        const term = searchFilter.toLowerCase();
        const matches = 
          post.title.toLowerCase().includes(term) ||
          post.titleHindi.toLowerCase().includes(term) ||
          post.organization.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedType, selectedQualification, searchFilter]);

  // Sort posts
  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'most_viewed') {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === 'closing_soon') {
      // posts with last dates sorted
      list.sort((a, b) => (a.applicationLastDate ? -1 : 1));
    }
    return list;
  }, [filteredPosts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedQualification('all');
    setSearchFilter('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const getAd = (key: string) => adSlots.find(a => a.slotKey === key);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Dynamic SEO Meta */}
      <SEOHead
        title={`${activeCategoryObj ? activeCategoryObj.nameHindi : pageTitle} - MP Exam Update 2026`}
        description={activeCategoryObj?.description || `${pageTitle} - मध्य प्रदेश सरकारी भर्ती, परीक्षा, प्रवेश पत्र, रिजल्ट एवं उत्तर कुंजी की नवीनतम सूची।`}
        canonicalUrl={`https://mpexamupdate.in/#${activeCategoryObj ? `category/${activeCategoryObj.slug}` : (initialPostType || 'jobs')}`}
        ogType="website"
        breadcrumbs={
          activeCategoryObj
            ? [
                { name: 'होम', item: 'https://mpexamupdate.in/' },
                { name: 'श्रेणियां', item: 'https://mpexamupdate.in/#categories' },
                { name: activeCategoryObj.nameHindi, item: `https://mpexamupdate.in/#category/${activeCategoryObj.slug}` }
              ]
            : [
                { name: 'होम', item: 'https://mpexamupdate.in/' },
                { name: pageTitle, item: `https://mpexamupdate.in/#${initialPostType || 'jobs'}` }
              ]
        }
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={
          activeCategoryObj
            ? [
                { label: 'श्रेणियां', route: 'categories' },
                { label: activeCategoryObj.nameHindi }
              ]
            : [{ label: 'सरकारी नौकरियां' }]
        }
        onNavigate={onNavigate}
      />

      {/* Page Title Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {activeCategoryObj ? `${activeCategoryObj.nameHindi} (${activeCategoryObj.nameEnglish || 'भर्ती'})` : pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeCategoryObj?.description || 'मध्य प्रदेश के समस्त सरकारी विभागों की नवीनतम भर्तियों, एडमिट कार्ड व परीक्षा परिणामों की सूची'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className="lg:hidden flex items-center gap-1.5 bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>फ़िल्टर ({filteredPosts.length})</span>
          </button>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            कुल <strong>{filteredPosts.length}</strong> परिणाम
          </span>
        </div>
      </div>

      {/* Top Banner Ad */}
      <AdSlot slot={getAd('header_ad')} />

      {/* Main Filter & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className={`lg:block ${isFilterDrawerOpen ? 'block' : 'hidden lg:block'} lg:col-span-1 space-y-5`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Filter className="w-4 h-4 text-blue-700" />
                <span>फ़िल्टर विकल्प (Filters)</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>रीसेट</span>
              </button>
            </div>

            {/* Keyword search filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                खोजें (Search Keyword)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="पद, विभाग या परीक्षा नाम..."
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                श्रेणी चुनें (Category)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600"
              >
                <option value="all">सभी श्रेणियां (All Categories)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameHindi} ({cat.nameEnglish})
                  </option>
                ))}
              </select>
            </div>

            {/* Post Type Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                पोस्ट प्रकार (Post Type)
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600"
              >
                <option value="all">सभी प्रकार (All Types)</option>
                <option value="job">सरकारी नौकरी (Jobs)</option>
                <option value="admit_card">एडमिट कार्ड (Admit Card)</option>
                <option value="result">रिजल्ट (Results)</option>
                <option value="answer_key">उत्तर कुंजी (Answer Key)</option>
              </select>
            </div>

            {/* Qualification Filter */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                योग्यता (Qualification)
              </label>
              <select
                value={selectedQualification}
                onChange={(e) => {
                  setSelectedQualification(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-blue-600"
              >
                <option value="all">सभी योग्यताएं</option>
                <option value="10th">10वीं पास (10th Pass)</option>
                <option value="12th">12वीं पास (12th Pass)</option>
                <option value="graduate">स्नातक (Graduate)</option>
              </select>
            </div>

            {/* Sidebar Ad in Desktop */}
            <AdSlot slot={getAd('sidebar_ad')} />

          </div>
        </aside>

        {/* Right Main Posts Grid */}
        <main className="lg:col-span-3 space-y-4">
          
          {/* Sort bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
              <span>क्रमबद्ध करें (Sort By):</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  sortBy === 'latest' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                नवीनतम (Latest)
              </button>
              <button
                onClick={() => setSortBy('closing_soon')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  sortBy === 'closing_soon' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                अंतिम तिथि निकट (Closing Soon)
              </button>
              <button
                onClick={() => setSortBy('most_viewed')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  sortBy === 'most_viewed' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                सर्वाधिक देखे गए (Popular)
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          {paginatedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <Building className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">चयनित फ़िल्टर के अनुसार कोई पोस्ट उपलब्ध नहीं है</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                कृपया फ़िल्टर विकल्पों को रीसेट करें या कोई भिन्न योग्यता/श्रेणी का चयन करें।
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-blue-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>फ़िल्टर रीसेट करें</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedPosts.map((post, idx) => (
                <React.Fragment key={post.id}>
                  <JobCard post={post} onSelect={onSelectPost} />
                  {idx === 2 && (
                    <div className="md:col-span-2">
                      <AdSlot slot={getAd('between_posts')} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between shadow-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>पिछला पृष्ठ</span>
              </button>

              <span className="text-xs font-semibold text-slate-700">
                पृष्ठ <strong>{currentPage}</strong> / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>अगला पृष्ठ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
