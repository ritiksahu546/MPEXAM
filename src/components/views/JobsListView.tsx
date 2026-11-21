import React, { useState, useMemo, useEffect } from 'react';
import { Post, Category, AdSlotConfig } from '../../types';
import { JobCard } from '../cards/JobCard';
import { AdSlot } from '../common/AdSlot';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { SEOHead } from '../common/SEOHead';
import { findAdSlot } from '../../utils/adSlots';
import {
  DEFAULT_BASE_URL,
  normalizeCanonicalUrl,
  normalizeCategorySlug,
  doesPostMatchCategory
} from '../../utils/sitemapGenerator';
import { 
  Filter, 
  RotateCcw, 
  ArrowUpDown, 
  Search, 
  Building, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  ArrowRight
} from 'lucide-react';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  initialCategorySlug?: string;
  initialPostType?: string;
  initialTag?: string;
  pageTitle?: string;
  canonicalPath?: string;
  noindex?: boolean;
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
  initialTag,
  pageTitle = 'मध्य प्रदेश सरकारी नौकरियां एवं परीक्षा अपडेट 2026',
  canonicalPath,
  noindex = false,
  onNavigate,
  onSelectPost
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedType, setSelectedType] = useState<string>(initialPostType || 'all');
  const [selectedQualification, setSelectedQualification] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>(initialTag || 'all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'closing_soon' | 'most_viewed'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Sync state when route props change
  useEffect(() => {
    setSelectedCategory(initialCategorySlug || 'all');
    setSelectedType(initialPostType || 'all');
    setSelectedTag(initialTag || 'all');
    setCurrentPage(1);
  }, [initialCategorySlug, initialPostType, initialTag]);

  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const normSelected = normalizeCategorySlug(selectedCategory);
    return categories.find(
      c => c.id === selectedCategory || c.slug === selectedCategory || normalizeCategorySlug(c.slug) === normSelected
    ) || null;
  }, [categories, selectedCategory]);

  // Deduplicated canonical categories for directory & sidebar
  const canonicalCategories = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) {
      if (!c || c.active === false) continue;
      const slug = normalizeCategorySlug(c.slug);
      if (!slug) continue;
      if (!map.has(slug)) {
        map.set(slug, { ...c, slug });
      }
    }
    return Array.from(map.values());
  }, [categories]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catMatches = doesPostMatchCategory(post, activeCategoryObj, selectedCategory);
        if (!catMatches) return false;
      }
      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'admit_card') {
          if (!doesPostMatchCategory(post, null, 'admit-card')) return false;
        } else if (selectedType === 'result') {
          if (!doesPostMatchCategory(post, null, 'results')) return false;
        } else if (selectedType === 'answer_key') {
          if (!doesPostMatchCategory(post, null, 'answer-key')) return false;
        } else if (post.postType !== selectedType) {
          return false;
        }
      }
      // Qualification filter
      if (selectedQualification !== 'all') {
        const q = (post.qualification || '').toLowerCase();
        if (selectedQualification === '10th' && !q.includes('10th') && !q.includes('10वीं')) return false;
        if (selectedQualification === '12th' && !q.includes('12th') && !q.includes('12वीं')) return false;
        if (selectedQualification === 'graduate' && !q.includes('graduat') && !q.includes('स्नातक')) return false;
      }
      // Tag filter
      if (selectedTag && selectedTag !== 'all') {
        const normTag = selectedTag.toLowerCase().trim();
        const tagMatches = post.tags?.some(t => t.toLowerCase().trim() === normTag);
        if (!tagMatches) return false;
      }
      // Text search
      if (searchFilter.trim() !== '') {
        const term = searchFilter.toLowerCase();
        const matches = 
          (post.title || '').toLowerCase().includes(term) ||
          (post.titleHindi || '').toLowerCase().includes(term) ||
          (post.organization || '').toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedType, selectedQualification, selectedTag, searchFilter, activeCategoryObj]);

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
      const getDaysLeftScore = (dateStr?: string) => {
        if (!dateStr) return 99999;
        const trimmed = dateStr.trim();
        let d: Date | null = null;
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          d = new Date(trimmed);
        } else {
          const parts = trimmed.split(/[-/]/);
          if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
            d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          } else {
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) d = parsed;
          }
        }
        if (!d || isNaN(d.getTime())) return 99999;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : 100000 + Math.abs(diff);
      };
      list.sort((a, b) => getDaysLeftScore(a.applicationLastDate) - getDaysLeftScore(b.applicationLastDate));
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
    setSelectedTag('all');
    setSearchFilter('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const getAd = (key: string) => findAdSlot(adSlots, key);

  const activeCategoryCanonicalSlug = activeCategoryObj
    ? normalizeCategorySlug(activeCategoryObj.slug)
    : (initialCategorySlug ? normalizeCategorySlug(initialCategorySlug) : '');

  const rawCanonical = canonicalPath 
    ? `${DEFAULT_BASE_URL}/${canonicalPath.replace(/^\/+/, '')}`
    : `${DEFAULT_BASE_URL}/${activeCategoryCanonicalSlug ? `category/${activeCategoryCanonicalSlug}` : (initialPostType ? (initialPostType === 'job' ? 'jobs' : initialPostType === 'admit_card' ? 'admit-cards' : initialPostType === 'result' ? 'results' : initialPostType === 'answer_key' ? 'answer-keys' : initialPostType) : 'jobs')}`;

  const computedCanonical = normalizeCanonicalUrl(rawCanonical);

  const formatCatLabel = (hi?: string, en?: string) => {
    const cleanHi = (hi || '').trim();
    const cleanEn = (en || '').trim();
    if (!cleanHi) return cleanEn;
    if (!cleanEn || cleanHi.toLowerCase().includes(cleanEn.toLowerCase())) return cleanHi;
    return `${cleanHi} (${cleanEn})`;
  };

  const activeCategoryLabel = activeCategoryObj
    ? formatCatLabel(activeCategoryObj.nameHindi, activeCategoryObj.nameEnglish || activeCategoryCanonicalSlug)
    : '';

  const seoTitle = activeCategoryObj
    ? `${activeCategoryLabel} भर्ती एवं परीक्षा अपडेट 2026`
    : pageTitle;

  const seoDescription = activeCategoryObj
    ? `${activeCategoryObj.description || activeCategoryObj.nameHindi}। ${activeCategoryLabel} 2026 की नवीनतम भर्ती विज्ञप्ति, ऑनलाइन आवेदन, पात्रता, एडमिट कार्ड और परिणाम।`
    : `${pageTitle} - मध्य प्रदेश सरकारी भर्ती, परीक्षा, प्रवेश पत्र, रिजल्ट एवं उत्तर कुंजी की नवीनतम आधिकारिक सूची।`;

  const isCategoriesHub = canonicalPath === 'categories';
  const isUnfilteredEmptyHub =
    !isCategoriesHub &&
    !searchFilter.trim() &&
    selectedQualification === 'all' &&
    selectedTag === 'all' &&
    filteredPosts.length === 0;
  const effectiveNoindex = noindex || isUnfilteredEmptyHub;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      
      {/* Dynamic SEO Meta */}
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={computedCanonical}
        noindex={effectiveNoindex}
        ogType="website"
        breadcrumbs={
          activeCategoryObj
            ? [
                { name: 'होम', item: `${DEFAULT_BASE_URL}/` },
                { name: 'श्रेणियां', item: `${DEFAULT_BASE_URL}/categories` },
                { name: activeCategoryObj.nameHindi, item: `${DEFAULT_BASE_URL}/category/${activeCategoryCanonicalSlug}` }
              ]
            : [
                { name: 'होम', item: `${DEFAULT_BASE_URL}/` },
                { name: pageTitle, item: computedCanonical }
              ]
        }
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={
          activeCategoryObj
            ? [
                { label: 'श्रेणियां', href: 'categories' },
                { label: activeCategoryObj.nameHindi }
              ]
            : [{ label: pageTitle }]
        }
        onNavigate={onNavigate}
      />

      {/* Page Title Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {activeCategoryObj ? `${activeCategoryLabel} — नवीनतम अपडेट 2026` : pageTitle}
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

      {/* Dedicated Categories Hub Directory Grid on /categories */}
      {isCategoriesHub && (
        <section aria-label="All Recruitment Categories Directory" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            प्रमुख भर्ती बोर्ड एवं परीक्षा श्रेणियां (Browse by Category)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canonicalCategories.map(cat => {
              const routePath =
                cat.slug === 'admit-card'
                  ? 'admit-cards'
                  : cat.slug === 'results'
                    ? 'results'
                    : cat.slug === 'answer-key'
                      ? 'answer-keys'
                      : `category/${cat.slug}`;
              return (
                <a
                  key={cat.slug}
                  href={`/${routePath}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(routePath);
                  }}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-700">
                      {formatCatLabel(cat.nameHindi, cat.nameEnglish)}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cat.description || `${cat.nameHindi} से जुड़ी सभी नवीनतम सरकारी नौकरियां, एडमिट कार्ड और परिणाम।`}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 mt-3 inline-flex items-center gap-1">
                    <span>{cat.nameHindi} अपडेट्स देखें</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

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
                {canonicalCategories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
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

            {/* Crawlable Category Quick Links in Sidebar */}
            <div className="pt-3 border-t border-slate-150">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                प्रमुख भर्ती श्रेणियां:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {canonicalCategories.slice(0, 10).map(cat => (
                  <a
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`category/${cat.slug}`);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                      activeCategoryCanonicalSlug === cat.slug
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                    }`}
                  >
                    {cat.nameHindi}
                  </a>
                ))}
              </div>
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

          {/* Active Tag Banner */}
          {selectedTag !== 'all' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-bold text-blue-900">
                  सक्रिय टैग फ़िल्टर: <span className="underline">#{selectedTag}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                टैग हटाएं ×
              </button>
            </div>
          )}

          {/* Posts Grid */}
          {paginatedPosts.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <Building className="w-10 h-10 text-slate-400 mx-auto" />
                <h2 className="font-bold text-base text-slate-800">
                  {activeCategoryObj
                    ? `${activeCategoryObj.nameHindi} में वर्तमान में कोई प्रत्यक्ष सक्रिय विज्ञप्ति नहीं है`
                    : 'चयनित फ़िल्टर के अनुसार कोई पोस्ट उपलब्ध नहीं है'}
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  नई अधिसूचना जारी होते ही यहाँ तुरंत अपडेट किया जाएगा। तब तक नीचे दी गई अन्य नवीनतम सक्रिय सरकारी भर्तियां देखें:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>सभी भर्तियां दिखाएं</span>
                  </button>
                  <a
                    href="/jobs"
                    onClick={(e) => { e.preventDefault(); onNavigate('jobs'); }}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    <span>नवीनतम सरकारी नौकरियां</span>
                  </a>
                </div>
              </div>

              {posts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900">
                    अन्य नवीनतम सक्रिय सरकारी भर्तियां (Latest Active Recruitments)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {posts.slice(0, 6).map(post => (
                      <JobCard key={post.id} post={post} onSelect={onSelectPost} />
                    ))}
                  </div>
                </div>
              )}
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
