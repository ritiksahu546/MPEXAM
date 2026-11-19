import React, { useState } from 'react';
import { Post, Category, AdSlotConfig, ImportantLink, SiteSettings, HomepageSectionsConfig } from '../../types';
import { QuickTableCard } from '../cards/QuickTableCard';
import { JobCard } from '../cards/JobCard';
import { CategoryPill } from '../cards/CategoryPill';
import { AdSlot } from '../common/AdSlot';
import { SEOHead } from '../common/SEOHead';
import { findAdSlot } from '../../utils/adSlots';
import { 
  Search,
  Sparkles, 
  Flame, 
  ExternalLink, 
  ChevronRight, 
  Award, 
  Shield, 
  GraduationCap, 
  FileText,
  BookmarkCheck,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Users,
  CheckCircle2,
  HelpCircle,
  Download,
  Landmark,
  Layers,
  Send,
  MessageCircle
} from 'lucide-react';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  importantLinks: ImportantLink[];
  settings: SiteSettings;
  homepageSections?: HomepageSectionsConfig;
  onNavigate: (route: string) => void;
  onSelectPost: (slug: string) => void;
}

export const HomeView: React.FC<Props> = ({
  posts,
  categories,
  adSlots,
  importantLinks,
  settings,
  homepageSections,
  onNavigate,
  onSelectPost
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter published posts
  const publishedPosts = posts.filter(p => p.status === 'published');
  
  const latestJobs = publishedPosts.filter(p => p.postType === 'job');
  const latestAdmitCards = publishedPosts.filter(p => p.postType === 'admit_card');
  const latestResults = publishedPosts.filter(p => p.postType === 'result');
  const latestAnswerKeys = publishedPosts.filter(p => p.postType === 'answer_key');
  const featuredPosts = publishedPosts.filter(p => p.featured);
  
  // Specific verticals
  const schemePosts = publishedPosts.filter(p => p.postType === 'scheme');
  const syllabusPosts = publishedPosts.filter(p => p.postType === 'syllabus');
  const previousPaperPosts = publishedPosts.filter(p => p.postType === 'previous_paper');

  const calendarPosts = publishedPosts.slice(0, 8);
  const getAd = (key: string) => findAdSlot(adSlots, key);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('jobs');
    }
  };

  const trendingSearchKeywords = [
    'MP Police Constable',
    'MPPSC 2026',
    'व्यापम वर्ग 3',
    'पटवारी भर्ती',
    'महिला पर्यवेक्षक',
    'वनरक्षक जेल प्रहरी'
  ];

  // Curated MP Welfare Schemes fallback if DB empty
  const defaultSchemes = [
    {
      id: 'scheme-ladli-behna',
      title: 'मुख्यमंत्री लाड़ली बहना योजना 2026',
      subtitle: 'महिला एवं बाल विकास विभाग मध्य प्रदेश',
      benefit: '₹1250 प्रतिमाह सीधे बैंक खाते में (डीबीटी)',
      eligibility: '21 से 60 वर्ष की विवाहित/कल्याणी/परित्यक्ता बहनें',
      categoryRoute: 'category/sarkari-yojana',
      link: 'https://cmladlibahna.mp.gov.in/'
    },
    {
      id: 'scheme-sambal',
      title: 'मुख्यमंत्री जन कल्याण (संबल 2.0) योजना',
      subtitle: 'श्रम विभाग मध्य प्रदेश शासन',
      benefit: 'शिक्षा सहायता, प्रसूति सहायता व अनुग्रह राशि',
      eligibility: 'असंगठित क्षेत्र के श्रमिक (संबल कार्ड धारक)',
      categoryRoute: 'category/sarkari-yojana',
      link: 'https://sambal.mp.gov.in/'
    },
    {
      id: 'scheme-seekho-kamao',
      title: 'मुख्यमंत्री सीखो-कमाओ योजना (MMSKY)',
      subtitle: 'तकनीकी शिक्षा, कौशल विकास एवं रोजगार विभाग',
      benefit: '₹8,000 से ₹10,000 मासिक स्टाइपेंड व ऑन-जॉब ट्रेनिंग',
      eligibility: '18 से 29 वर्ष के 12वीं/आईटीआई/डिप्लोमा/ग्रेजुएट युवा',
      categoryRoute: 'category/sarkari-yojana',
      link: 'https://mmsky.mp.gov.in/'
    },
    {
      id: 'scheme-udyam-kranti',
      title: 'मुख्यमंत्री उद्यम क्रांति योजना',
      subtitle: 'सूक्ष्म, लघु एवं मध्यम उद्यम विभाग',
      benefit: '₹1 लाख से ₹50 लाख तक बैंक ऋण + 3% ब्याज अनुदान',
      eligibility: '18 से 40 वर्ष के 8वीं/10वीं उत्तीर्ण युवा उद्यमी',
      categoryRoute: 'category/sarkari-yojana',
      link: 'https://samast.mponline.gov.in/'
    }
  ];

  // Curated Previous Papers fallback
  const defaultPapers = [
    {
      id: 'paper-mppsc-pre',
      title: 'MPPSC राज्य सेवा प्रारंभिक परीक्षा (GS Paper 1 & 2)',
      years: '2020 - 2024 (हल सहित)',
      dept: 'मध्य प्रदेश लोक सेवा आयोग इंदौर',
      categoryRoute: 'category/previous-papers'
    },
    {
      id: 'paper-mp-police',
      title: 'एमपी पुलिस कांस्टेबल भर्ती परीक्षा प्रश्न पत्र',
      years: '2022 - 2023 All Shifts',
      dept: 'MPESB (व्यापम) भोपाल',
      categoryRoute: 'category/previous-papers'
    },
    {
      id: 'paper-patwari',
      title: 'मध्य प्रदेश पटवारी संयुक्त भर्ती परीक्षा साल्व्ड पेपर',
      years: '2017 & 2023 Solutions',
      dept: 'राजस्व विभाग म.प्र.',
      categoryRoute: 'category/previous-papers'
    },
    {
      id: 'paper-vanrakshak',
      title: 'वनरक्षक एवं जेल प्रहरी भर्ती परीक्षा प्रश्न पत्र',
      years: '2023 संयुक्त परीक्षा',
      dept: 'वन एवं जेल विभाग म.प्र.',
      categoryRoute: 'category/previous-papers'
    }
  ];

  // Curated Syllabus items fallback
  const defaultSyllabus = [
    {
      id: 'syl-mppsc',
      title: 'MPPSC राज्य सेवा परीक्षा नया पाठ्यक्रम 2026',
      details: 'प्रारंभिक (200 अंक) + मुख्य परीक्षा (1500 अंक) + साक्षात्कार (185 अंक)',
      categoryRoute: 'category/syllabus'
    },
    {
      id: 'syl-esb-group4',
      title: 'MPESB ग्रुप-4 सहायक ग्रेड 3 व स्टेनो पाठ्यक्रम',
      details: 'सामान्य ज्ञान, हिंदी, अंग्रेजी, गणित, कंप्यूटर व रीजनिंग (100 अंक)',
      categoryRoute: 'category/syllabus'
    },
    {
      id: 'syl-mp-police',
      title: 'एमपी पुलिस आरक्षक (जीडी व रेडियो) परीक्षा पैटर्न',
      details: 'लिखित परीक्षा (100 अंक) + शारीरिक दक्षता परीक्षा (100 अंक)',
      categoryRoute: 'category/syllabus'
    },
    {
      id: 'syl-shikshak-varg3',
      title: 'एमपी प्राथमिक शिक्षक पात्रता परीक्षा (वर्ग 3) सिलेबस',
      details: 'बाल विकास, भाषा 1 & 2, गणित व पर्यावरण अध्ययन (150 अंक)',
      categoryRoute: 'category/syllabus'
    }
  ];

  const homepageFaqs = [
    {
      question: 'मध्य प्रदेश सरकारी नौकरी में आवेदन हेतु रोजगार पंजीयन अनिवार्य है क्या?',
      answer: 'हाँ, मध्य प्रदेश की अधिकांश भर्ती परीक्षाओं (विशेषकर MPESB एवं पुलिस भर्ती) में आवेदन करते समय अभ्यर्थी का मध्य प्रदेश रोजगार पोर्टल (mprojgar.gov.in) पर जीवित पंजीयन होना अनिवार्य होता है।'
    },
    {
      question: 'क्या अन्य राज्यों के उम्मीदवार भी MP की सरकारी नौकरियों में आवेदन कर सकते हैं?',
      answer: 'हाँ, अन्य राज्यों के अभ्यर्थी भी सामान्य (अनारक्षित) श्रेणी के अंतर्गत आवेदन कर सकते हैं। आरक्षित श्रेणियों (SC/ST/OBC/EWS) के आरक्षण एवं आयु छूट का लाभ केवल मध्य प्रदेश के मूल निवासियों को देय होता है।'
    },
    {
      question: 'MPESB (व्यापम) प्रोफाइल रजिस्ट्रेशन और ई-केवाईसी कैसे करें?',
      answer: 'MP Online कियोस्क अथवा ESB की आधिकारिक वेबसाइट पर आधार नंबर, फोटो, हस्ताक्षर एवं हस्तलिखित घोषणापत्र अपलोड कर प्रोफाइल पंजीयन किया जाता है। एक बार बनी प्रोफाइल आईडी से आगामी सभी परीक्षाओं में सरलता से आवेदन किया जा सकता है।'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Dynamic SEO Meta & Structured Data */}
      <SEOHead
        title={`${settings.siteName || 'MP Exam Update'} - मध्य प्रदेश सरकारी नौकरी, व्यापम, MPPSC, रिजल्ट 2026`}
        description={settings.siteDescription || 'मध्य प्रदेश की समस्त सरकारी भर्तियां (MP Govt Jobs 2026), MPPSC, MPESB (व्यापम), एमपी पुलिस, पटवारी, शिक्षक भर्ती, एडमिट कार्ड, रिजल्ट एवं उत्तर कुंजी सबसे पहले।'}
        canonicalUrl="https://mpexamupdates.in/"
        ogType="website"
        faqs={homepageFaqs}
      />

      {/* =========================================================================
          1. HERO + PROMINENT SEARCH
          ========================================================================= */}
      <section aria-label="Hero Search Section" className="max-w-7xl mx-auto px-3 sm:px-4 pt-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-10 shadow-lg border border-blue-800/60">
          
          {/* Subtle Ambient Background Light */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/80 border border-blue-700/80 text-amber-300 text-xs font-bold mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>मध्य प्रदेश शासकीय भर्ती एवं परीक्षा सूचना मंच • 2026</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
              मध्य प्रदेश सरकारी नौकरी एवं परीक्षा पोर्टल
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-6 max-w-2xl mx-auto">
              MPPSC, MPESB (व्यापम), एमपी पुलिस, शिक्षक पात्रता (TET), पटवारी, एडमिट कार्ड एवं रिजल्ट की सबसे सटीक व आधिकारिक जानकारी।
            </p>

            {/* Prominent Search Bar */}
            <form onSubmit={handleHeroSearch} className="relative max-w-2xl mx-auto mb-4">
              <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5 border-2 border-white/20 focus-within:border-amber-400 transition-all">
                <div className="pl-3.5 pr-2 text-slate-400">
                  <Search className="w-5 h-5 text-blue-800" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खोजें: MP Police, MPPSC, Patwari, Vyapam, शिक्षक भर्ती..."
                  className="w-full py-2.5 px-1 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold px-5 sm:px-7 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>खोजें</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </button>
              </div>
            </form>

            {/* Popular Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-blue-200">
              <span className="font-semibold text-amber-300">प्रमुख खोज:</span>
              {trendingSearchKeywords.map((keyword, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onNavigate(`jobs?q=${encodeURIComponent(keyword)}`)}
                  className="bg-blue-800/70 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg border border-blue-700/60 transition-colors text-[11px] font-medium cursor-pointer"
                >
                  {keyword}
                </button>
              ))}
            </div>

            {/* Community Quick Join Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-5 border-t border-blue-800/60 text-xs">
              <a
                href={settings.whatsappLink || 'https://whatsapp.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>WhatsApp अलर्ट चैनल</span>
              </a>
              <a
                href={settings.telegramLink || 'https://t.me'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-sky-600/90 hover:bg-sky-600 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs"
              >
                <Send className="w-4 h-4 text-sky-200" />
                <span>Telegram ग्रुप (50,000+ छात्र)</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. QUICK CATEGORIES
          ========================================================================= */}
      {homepageSections?.quickCategoryGrid !== false && (
        <section aria-label="Category Quick Links" className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-5 bg-blue-700 rounded-xs"></div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  सीधा प्रवेश श्रेणियां (Quick Categories)
                </h2>
              </div>
              <a
                href="/categories"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('categories');
                }}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>सभी श्रेणियां</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.filter(c => c.active !== false).slice(0, 12).map((cat) => (
                <CategoryPill
                  key={cat.id}
                  category={cat}
                  onClick={(slug) => onNavigate(`category/${slug}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          3. ADVERTISEMENT SLOT
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('header_ad') || getAd('top_content_ad')} />
      </div>

      {/* =========================================================================
          4. LATEST GOVERNMENT JOBS (High-Density Cards with 3 Buttons)
          ========================================================================= */}
      {homepageSections?.latestPosts !== false && (
        <section aria-label="Latest Government Jobs" className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-7 bg-blue-800 rounded-xs"></div>
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                  नवीनतम सरकारी नौकरी (Latest MP Govt Jobs 2026)
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                  मध्य प्रदेश शासन एवं केंद्र सरकार की ताज़ा सक्रिय विज्ञप्तियां
                </p>
              </div>
            </div>
            <a
              href="/jobs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('jobs');
              }}
              className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>सभी भर्तियां ({latestJobs.length})</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {(latestJobs.length > 0 ? latestJobs.slice(0, 6) : publishedPosts.slice(0, 6)).map((post) => (
              <JobCard
                key={post.id}
                post={post}
                onSelect={onSelectPost}
              />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          5. ADMIT CARD / RESULT / ANSWER KEY (The 4-Box Matrix)
          ========================================================================= */}
      <section aria-label="Quick Updates Matrix" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-6 bg-amber-600 rounded-xs"></div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                त्वरित परीक्षा अपडेट (Admit Card / Result / Answer Key)
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            प्रवेश पत्र, परिणाम व उत्तर कुंजी एक नज़र में
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
            title="उत्तर कुंजी"
            titleEn="Answer Key"
            posts={latestAnswerKeys}
            accentColor="purple"
            onSelectPost={onSelectPost}
            onViewAll={() => onNavigate('answer-keys')}
          />
        </div>
      </section>

      {/* Mid-Content Ad Slot */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('between_posts') || getAd('article_middle')} />
      </div>

      {/* =========================================================================
          6. EXAM CALENDAR
          ========================================================================= */}
      {homepageSections?.examCalendar !== false && (
        <section aria-label="MP Exam Calendar 2026" className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shadow-2xs">
                  <Calendar className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    मध्य प्रदेश परीक्षा कैलेंडर 2026 (MP Upcoming Exam Schedule)
                  </h3>
                  <p className="text-xs text-slate-500">
                    आगामी भर्ती परीक्षाओं की संभावित तिथियां एवं आवेदन समय सारिणी
                  </p>
                </div>
              </div>
              <a
                href="/jobs"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('jobs');
                }}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>सभी समय-सारिणी</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">भर्ती / परीक्षा का नाम</th>
                    <th className="py-3 px-4">विभाग / आयोग</th>
                    <th className="py-3 px-4">आवेदन अंतिम तिथि</th>
                    <th className="py-3 px-4">परीक्षा तिथि / स्थिति</th>
                    <th className="py-3 px-4 text-right">विवरण</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {calendarPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <a
                          href={`/job/${post.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectPost(post.slug);
                          }}
                          className="hover:text-blue-700 cursor-pointer line-clamp-1 block"
                        >
                          {post.titleHindi || post.title}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {post.organization}
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {post.applicationLastDate || 'शीघ्र उपलब्ध'}
                      </td>
                      <td className="py-3 px-4 text-slate-900">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>{post.examDate || 'शीघ्र घोषित'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/job/${post.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectPost(post.slug);
                          }}
                          className="inline-block px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          देखें →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          7. GOVERNMENT SCHEMES (सरकारी योजनाएँ)
          ========================================================================= */}
      <section aria-label="Government Schemes" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shadow-2xs">
                <Landmark className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  मध्य प्रदेश सरकारी योजनाएं 2026 (MP Government Welfare Schemes)
                </h3>
                <p className="text-xs text-slate-500">
                  लाड़ली बहना, संबल योजना, सीखो-कमाओ एवं अन्य प्रमुख जनकल्याणकारी योजनाएं
                </p>
              </div>
            </div>
            <a
              href="/category/sarkari-yojana"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('category/sarkari-yojana');
              }}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>सभी योजनाएं</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(schemePosts.length > 0 ? schemePosts.slice(0, 4) : defaultSchemes).map((item: any) => (
              <div
                key={item.id}
                className="bg-slate-50/70 border border-slate-200 hover:border-rose-400 rounded-xl p-4 transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase tracking-wider mb-2 inline-block">
                    कल्याणकारी योजना
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                    {item.titleHindi || item.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mb-2.5">
                    {item.subtitle || item.organization || 'मध्य प्रदेश शासन'}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-150 mb-3">
                    <div>
                      <span className="text-slate-500 text-[11px]">लाभ: </span>
                      <strong className="text-emerald-700">{item.benefit || item.salary || 'आर्थिक व सामाजिक सुरक्षा सहायता'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">पात्रता: </span>
                      <span className="text-slate-800">{item.eligibility || item.qualification || 'मध्य प्रदेश के मूल निवासी'}</span>
                    </div>
                  </div>
                </div>

                {item.slug ? (
                  <a
                    href={`/job/${item.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPost(item.slug);
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>योजना विवरण व आवेदन</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 text-center text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>आधिकारिक पोर्टल</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. PREVIOUS YEAR PAPERS & 9. SYLLABUS SECTION
          ========================================================================= */}
      <section aria-label="Study Material and Syllabus" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Previous Year Papers Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shadow-2xs">
                    <BookOpen className="w-5 h-5 text-indigo-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      पिछले वर्षों के प्रश्न पत्र (Previous Year Papers)
                    </h3>
                    <p className="text-xs text-slate-500">
                      MPPSC, व्यापम, पुलिस एवं पटवारी के पिछले वर्षों के हल प्रश्न पत्र
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(previousPaperPosts.length > 0 ? previousPaperPosts.slice(0, 4) : defaultPapers).map((paper: any) => (
                  <a
                    key={paper.id}
                    href={paper.slug ? `/job/${paper.slug}` : `/${paper.categoryRoute || 'category/previous-papers'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (paper.slug) {
                        onSelectPost(paper.slug);
                      } else {
                        onNavigate(paper.categoryRoute || 'category/previous-papers');
                      }
                    }}
                    className="p-3 bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-3 block"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-700 leading-snug line-clamp-1">
                        {paper.titleHindi || paper.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{paper.dept || paper.organization || 'मध्य प्रदेश परीक्षा बोर्ड'}</span>
                        <span>•</span>
                        <span className="text-indigo-700 font-bold">{paper.years || 'PDF उपलब्ध'}</span>
                      </div>
                    </div>
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-400 text-indigo-600 shrink-0 shadow-2xs">
                      <Download className="w-4 h-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <a
                href="/category/previous-papers"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('category/previous-papers');
                }}
                className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>सभी प्रश्न पत्र संग्रह देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Detailed Syllabus Column */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-2xs">
                    <FileCheck2 className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      विस्तृत परीक्षा पाठ्यक्रम (Detailed Syllabus & Pattern)
                    </h3>
                    <p className="text-xs text-slate-500">
                      नवीनतम अंक योजना, विषयवार पाठ्यक्रम एवं चयन प्रक्रिया
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {(syllabusPosts.length > 0 ? syllabusPosts.slice(0, 4) : defaultSyllabus).map((syl: any) => (
                  <a
                    key={syl.id}
                    href={syl.slug ? `/job/${syl.slug}` : `/${syl.categoryRoute || 'category/syllabus'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (syl.slug) {
                        onSelectPost(syl.slug);
                      } else {
                        onNavigate(syl.categoryRoute || 'category/syllabus');
                      }
                    }}
                    className="p-3 bg-slate-50/70 hover:bg-teal-50/40 border border-slate-200 hover:border-teal-300 rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-3 block"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-teal-800 leading-snug line-clamp-1">
                        {syl.titleHindi || syl.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {syl.details || syl.examPattern || syl.syllabus || 'अंक विभाजन एवं विषय सूची'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <a
                href="/category/syllabus"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('category/syllabus');
                }}
                className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>सभी परीक्षाओं का सिलेबस देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          10. SEO/INFORMATIONAL CONTENT (Crawlable Rich Text for Google Indexing)
          ========================================================================= */}
      <section aria-label="SEO Informational Guide" className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>मार्गदर्शिका • MP Govt Recruitment Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
              मध्य प्रदेश सरकारी नौकरी एवं भर्ती परीक्षाएं 2026: एक संपूर्ण परिचय
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              मध्य प्रदेश में शासकीय सेवा में चयन हेतु राज्य सरकार द्वारा विभिन्न आयोगों और भर्ती मंडलों के माध्यम से वर्ष भर पारदर्शी परीक्षाएं आयोजित की जाती हैं। <strong>MP Exam Update (mpexamupdates.in)</strong> पोर्टल का उद्देश्य प्रदेश के लाखों अभ्यर्थियों तक नवीनतम विज्ञप्तियों, आवेदन प्रक्रियाओं, प्रवेश पत्रों और परीक्षा परिणामों की आधिकारिक व सटीक जानकारी बिना किसी भ्रामक विज्ञापन के समय पर पहुंचाना है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-700 shrink-0" />
                <a
                  href="/category/mppsc"
                  onClick={(e) => { e.preventDefault(); onNavigate('category/mppsc'); }}
                  className="hover:text-blue-700 hover:underline"
                >
                  1. मध्य प्रदेश लोक सेवा आयोग (MPPSC इंदौर)
                </a>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MPPSC द्वारा राज्य प्रशासनिक सेवा (डिप्टी कलेक्टर), राज्य पुलिस सेवा (डीएसपी), वाणिज्यिक कर अधिकारी, वन सेवा एवं सहायक प्राध्यापक पदों हेतु राज्य सेवा परीक्षा आयोजित की जाती है। परीक्षा तीन चरणों — प्रारंभिक, मुख्य एवं साक्षात्कार में संपन्न होती है।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-150 bg-slate-50/60">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                <a
                  href="/category/mpesb"
                  onClick={(e) => { e.preventDefault(); onNavigate('category/mpesb'); }}
                  className="hover:text-blue-700 hover:underline"
                >
                  2. म.प्र. कर्मचारी चयन मंडल (MPESB / व्यापम भोपाल)
                </a>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MPESB तृतीय एवं चतुर्थ श्रेणी के गैर-राजपत्रित पदों जैसे पुलिस आरक्षक, पटवारी, सब-इंजीनियर, ग्रुप-2, ग्रुप-3, ग्रुप-4, जेल प्रहरी एवं प्राथमिक/माध्यमिक शिक्षक पात्रता परीक्षा (MP TET) का आयोजन करता है।
              </p>
            </div>
          </div>

          {/* FAQs Accordion for Candidates */}
          <div className="pt-3 border-t border-slate-150">
            <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                  प्र. मध्य प्रदेश सरकारी नौकरी में आवेदन हेतु रोजगार पंजीयन अनिवार्य है क्या?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  हाँ, मध्य प्रदेश की अधिकांश भर्ती परीक्षाओं (विशेषकर MPESB एवं पुलिस भर्ती) में आवेदन करते समय अभ्यर्थी का <strong>मध्य प्रदेश रोजगार पोर्टल (mprojgar.gov.in)</strong> पर जीवित पंजीयन होना अनिवार्य होता है।
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                  प्र. क्या अन्य राज्यों के उम्मीदवार भी MP की सरकारी नौकरियों में आवेदन कर सकते हैं?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  हाँ, अन्य राज्यों के अभ्यर्थी भी सामान्य (अनारक्षित) श्रेणी के अंतर्गत आवेदन कर सकते हैं। आरक्षित श्रेणियों (SC/ST/OBC/EWS) के आरक्षण एवं आयु छूट का लाभ केवल मध्य प्रदेश के मूल निवासियों को देय होता है।
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-1">
                  प्र. MPESB (व्यापम) प्रोफाइल रजिस्ट्रेशन और ई-केवाईसी कैसे करें?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MP Online कियोस्क अथवा ESB की आधिकारिक वेबसाइट पर आधार नंबर, फोटो, हस्ताक्षर एवं हस्तलिखित घोषणापत्र अपलोड कर प्रोफाइल पंजीयन किया जाता है। एक बार बनी प्रोफाइल आईडी से आगामी सभी परीक्षाओं में सरलता से आवेदन किया जा सकता है।
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          11. IMPORTANT OFFICIAL LINKS
          ========================================================================= */}
      {homepageSections?.importantLinks !== false && (
        <section aria-label="Official Government Portals" className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-amber-400" />
                  <span>महत्वपूर्ण शासकीय पोर्टल लिंक (Official MP Portals)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  मध्य प्रदेश शासन के अधिकृत भर्ती पोर्टल, परिणाम एवं पंजीयन वेबसाइट
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
                  className="p-3 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                      {link.titleHindi || link.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {link.url}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                    <span>{link.buttonLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          12. FOOTER AD SLOT (Before App.tsx Footer)
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <AdSlot slot={getAd('footer_ad')} />
      </div>

    </div>
  );
};
