import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Post, 
  Category, 
  Tag,
  AdSlotConfig, 
  ImportantLink, 
  SiteSettings, 
  UserProfile,
  HomepageSectionsConfig 
} from './types';
import { 
  getPosts, 
  getAllPostsForAdmin,
  getCategories, 
  getTags,
  getAdSlots, 
  getImportantLinks, 
  getSettings,
  getHomepageSections,
  savePost,
  deletePost,
  incrementPostViews,
  saveCategory,
  deleteCategory,
  saveTag,
  deleteTag,
  updateAdSlot,
  saveImportantLink,
  deleteImportantLink,
  updateSettings,
  saveHomepageSections,
  resetToSampleData,
  seedInitialDataToFirestore,
  INITIAL_HOMEPAGE_SECTIONS
} from './services/storage';
import { onAuthStateChanged, auth, logOut, testFirebaseConnection, verifyAdminAuthorization } from './services/firebase';

import { Header } from './components/common/Header';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/modals/SearchModal';
import { HomeView } from './components/views/HomeView';
import { JobDetailView } from './components/views/JobDetailView';
import { JobsListView } from './components/views/JobsListView';
import { StaticPageView } from './components/views/StaticPageView';
import { SitemapView } from './components/views/SitemapView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { ResetPasswordView } from './components/admin/ResetPasswordView';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { DataErrorState } from './components/common/DataErrorState';
import { INITIAL_SITE_SETTINGS } from './data/initialData';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Extracts Firebase password reset action code (oobCode) from either URL search parameters or hash.
 */
function extractPasswordResetCode(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Search params (?mode=resetPassword&oobCode=XYZ or ?oobCode=XYZ)
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    if (oobCode && (mode === 'resetPassword' || !mode)) {
      return oobCode;
    }
  }

  // 2. Hash search params (#reset-password?oobCode=XYZ or #...?mode=resetPassword&oobCode=XYZ)
  if (window.location.hash) {
    const qIndex = window.location.hash.indexOf('?');
    if (qIndex !== -1) {
      const hashParams = new URLSearchParams(window.location.hash.substring(qIndex));
      const mode = hashParams.get('mode');
      const oobCode = hashParams.get('oobCode');
      if (oobCode && (mode === 'resetPassword' || !mode)) {
        return oobCode;
      }
    }
  }

  return null;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>([]);
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [homepageSections, setHomepageSections] = useState<HomepageSectionsConfig>(INITIAL_HOMEPAGE_SECTIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const location = useLocation();
  const routerNavigate = useNavigate();

  const [resetCode, setResetCode] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Load all CMS data
  const refreshData = useCallback(async (asAdmin = false) => {
    setIsLoading(true);
    setDataError(null);
    try {
      const [
        fetchedPosts, 
        fetchedCats, 
        fetchedTags, 
        fetchedAds, 
        fetchedLinks, 
        fetchedSettings,
        fetchedSections
      ] = await Promise.all([
        asAdmin ? getAllPostsForAdmin() : getPosts(),
        getCategories(),
        getTags(),
        getAdSlots(),
        getImportantLinks(),
        getSettings(),
        getHomepageSections()
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCats);
      setTags(fetchedTags);
      setAdSlots(fetchedAds);
      setImportantLinks(fetchedLinks);
      setSettings(fetchedSettings);
      setHomepageSections(fetchedSections);
    } catch (err) {
      console.error('Error loading data:', err);
      setDataError('डेटा लोड करने में समस्या आई। कृपया पृष्ठ को रीफ्रेश करें।');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    testFirebaseConnection();
    refreshData();

    // Listen to Firebase Auth state if available
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const isAuthorized = await verifyAdminAuthorization(user);
            if (isAuthorized) {
              const adminUser: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Authorized Admin',
                role: 'admin',
                isAdmin: true
              };
              setCurrentUser(adminUser);
              const adminPosts = await getAllPostsForAdmin();
              setPosts(adminPosts);
            } else {
              console.warn(`User ${user.email} is not authorized in admins collection. Signing out.`);
              await logOut();
              setCurrentUser(null);
              const publicPosts = await getPosts();
              setPosts(publicPosts);
            }
          } catch (authErr) {
            console.error('Error verifying admin authorization:', authErr);
            await logOut();
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, [refreshData]);

  // Compute canonical path-based route from browser location
  const currentRoute = useMemo(() => {
    const rawPath = location.pathname.replace(/^\//, '');
    const cleanPath = rawPath.split('?')[0];
    return cleanPath || 'home';
  }, [location.pathname]);

  // Backward Compatibility: Automatically redirect legacy hash URLs to proper clean paths
  useEffect(() => {
    const handleHashMigration = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const clean = hash.replace(/^#\/?/, '');
      if (!clean) return;

      // Avoid redirect loops if hash is empty or already matches path
      if (clean.startsWith('job/')) {
        const slug = clean.replace(/^job\//, '');
        routerNavigate(`/job/${slug}`, { replace: true });
      } else if (clean.startsWith('post/')) {
        const slug = clean.replace(/^post\//, '');
        routerNavigate(`/job/${slug}`, { replace: true });
      } else if (clean.startsWith('category/')) {
        const slug = clean.replace(/^category\//, '');
        routerNavigate(`/category/${slug}`, { replace: true });
      } else if (['jobs', 'admit-cards', 'results', 'answer-keys', 'categories', 'admin', 'about', 'contact', 'privacy-policy', 'terms-and-conditions', 'disclaimer', 'advertisement', 'sitemap', 'search'].includes(clean.split('?')[0])) {
        routerNavigate(`/${clean}`, { replace: true });
      } else if (clean === 'home' || clean === '') {
        routerNavigate('/', { replace: true });
      }
    };

    handleHashMigration();
    window.addEventListener('hashchange', handleHashMigration);
    return () => window.removeEventListener('hashchange', handleHashMigration);
  }, [routerNavigate]);

  // Sync Firebase Auth Password Reset action code from URL (search params or hash)
  useEffect(() => {
    const oobCode = extractPasswordResetCode();
    if (oobCode) {
      setResetCode(oobCode);
      if (location.pathname !== '/reset-password') {
        routerNavigate('/reset-password', { replace: true });
      }
    }
  }, [location.pathname, routerNavigate]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync Dynamic Site Settings to Document Head (Favicon, Google Analytics, AdSense, Search Console)
  useEffect(() => {
    // 1. Favicon sync
    const faviconUrl = settings.faviconUrl || settings.favicon;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }

    // Helper validators to avoid injecting fake/demo IDs
    const isValidGoogleAnalyticsId = (id?: string): boolean => {
      if (!id) return false;
      const clean = id.trim();
      if (!clean || clean === 'G-MPEXAM2026' || clean.includes('0000000') || clean.includes('XXXXX')) return false;
      return /^G-[A-Z0-9]{4,15}$/i.test(clean);
    };

    const isValidAdSenseId = (id?: string): boolean => {
      if (!id) return false;
      const clean = id.trim();
      if (!clean || clean === 'ca-pub-0000000000000000' || clean.includes('0000000000000000') || clean.includes('XXXXXXXX')) return false;
      const digits = clean.replace(/[^0-9]/g, '');
      return digits.length === 16 && !/^0+$/.test(digits);
    };

    const isValidSearchConsoleCode = (code?: string): boolean => {
      if (!code) return false;
      const clean = code.trim();
      if (!clean || clean === 'google-site-verification-mp-exam-update' || clean.includes('XXXXXXXX')) return false;
      return clean.length >= 8;
    };

    // 2. Google Search Console Verification (only if real verification code configured)
    const gscCode = settings.googleSearchConsoleVerification || settings.searchConsoleCode;
    if (isValidSearchConsoleCode(gscCode)) {
      let meta = document.querySelector("meta[name='google-site-verification']") as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        document.head.appendChild(meta);
      }
      meta.content = gscCode!.trim();
    }

    // 3. Google Analytics (gtag.js) - only if real production GA4 ID configured
    if (isValidGoogleAnalyticsId(settings.googleAnalyticsId)) {
      const gaId = settings.googleAnalyticsId!.trim();
      const scriptId = 'ga-gtag-script';
      if (!document.getElementById(scriptId)) {
        const gaScript = document.createElement('script');
        gaScript.id = scriptId;
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(gaScript);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'ga-gtag-init';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(inlineScript);
      }
    }

    // 4. Google AdSense auto-ads script - only if real 16-digit publisher ID configured
    const adsenseClient = settings.googleAdsenseClientId || settings.adSensePublisherId;
    if (isValidAdSenseId(adsenseClient)) {
      const scriptId = 'google-adsense-script';
      if (!document.getElementById(scriptId)) {
        const adsenseScript = document.createElement('script');
        adsenseScript.id = scriptId;
        adsenseScript.async = true;
        adsenseScript.crossOrigin = 'anonymous';
        const formattedClient = adsenseClient!.trim().startsWith('ca-pub-') 
          ? adsenseClient!.trim() 
          : `ca-pub-${adsenseClient!.trim().replace(/^pub-/, '')}`;
        adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClient}`;
        document.head.appendChild(adsenseScript);
      }
    }
  }, [settings]);

  // Standardized path-based navigation handler for all child views
  const navigate = useCallback((route: string) => {
    let target = route.trim();
    if (target === 'home' || target === '') {
      target = '/';
    } else if (!target.startsWith('/')) {
      target = '/' + target;
    }
    routerNavigate(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [routerNavigate]);

  const handleSelectPost = useCallback((slug: string) => {
    incrementPostViews(slug);
    navigate(`/job/${slug}`);
  }, [navigate]);

  // Only published posts for public view (Requirement #7)
  const publishedPosts = useMemo(() => {
    return posts.filter(p => p.status === 'published');
  }, [posts]);

  // Admin Actions
  const handleSavePost = async (post: Post) => {
    const saved = await savePost(post);
    setPosts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleSaveCategory = async (cat: Category) => {
    const saved = await saveCategory(cat);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteCategory = async (catId: string) => {
    await deleteCategory(catId);
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleSaveTag = async (tag: Tag) => {
    const saved = await saveTag(tag);
    setTags(prev => {
      const idx = prev.findIndex(t => t.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteTag = async (tagId: string) => {
    await deleteTag(tagId);
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  const handleUpdateAdSlot = async (slot: AdSlotConfig) => {
    await updateAdSlot(slot);
    setAdSlots(prev => {
      const idx = prev.findIndex(s => (s.slotKey && s.slotKey === slot.slotKey) || (s.id && s.id === slot.id));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = slot;
        return next;
      }
      return [...prev, slot];
    });
  };

  const handleSaveImportantLink = async (link: ImportantLink) => {
    const saved = await saveImportantLink(link);
    setImportantLinks(prev => {
      const idx = prev.findIndex(l => l.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleteImportantLink = async (linkId: string) => {
    await deleteImportantLink(linkId);
    setImportantLinks(prev => prev.filter(l => l.id !== linkId));
  };

  const handleSaveSettings = async (newSettings: SiteSettings) => {
    const saved = await updateSettings(newSettings);
    setSettings(saved);
  };

  const handleSaveHomepageSections = async (sections: HomepageSectionsConfig) => {
    const saved = await saveHomepageSections(sections);
    setHomepageSections(saved);
  };

  const handleResetData = () => {
    resetToSampleData();
    refreshData(currentUser?.isAdmin);
  };

  const handleSeedData = async () => {
    await seedInitialDataToFirestore();
    await refreshData(currentUser?.isAdmin);
  };

  const handleLogin = async (user: UserProfile) => {
    setCurrentUser(user);
    try {
      const adminPosts = await getAllPostsForAdmin();
      setPosts(adminPosts);
    } catch (err) {
      console.error('Error fetching admin posts on login:', err);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    await logOut();
    try {
      const publicPosts = await getPosts();
      setPosts(publicPosts);
    } catch (err) {
      console.error('Error fetching public posts on logout:', err);
    }
  };

  // Route Dispatcher
  const renderCurrentView = () => {
    // 1. Password Reset View (Firebase Auth Action Code)
    if (currentRoute === 'reset-password') {
      return (
        <ResetPasswordView
          oobCode={resetCode}
          onSuccess={() => {
            setResetCode('');
            navigate('admin');
          }}
          onCancel={() => {
            setResetCode('');
            navigate('admin');
          }}
          onRequestNewLink={() => {
            setResetCode('');
            navigate('admin');
          }}
        />
      );
    }

    // 2. Admin Panel / Admin Login
    if (currentRoute === 'admin') {
      if (!currentUser) {
        return (
          <AdminLoginView
            settings={settings}
            onSuccess={handleLogin}
            onNavigateHome={() => navigate('home')}
          />
        );
      }

      return (
        <AdminDashboard
          posts={posts}
          categories={categories}
          tags={tags}
          adSlots={adSlots}
          importantLinks={importantLinks}
          settings={settings}
          homepageSections={homepageSections}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveTag={handleSaveTag}
          onDeleteTag={handleDeleteTag}
          onUpdateAdSlot={handleUpdateAdSlot}
          onSaveImportantLink={handleSaveImportantLink}
          onDeleteImportantLink={handleDeleteImportantLink}
          onSaveSettings={handleSaveSettings}
          onSaveHomepageSections={handleSaveHomepageSections}
          onResetData={handleResetData}
          onSeedData={handleSeedData}
          onViewPost={handleSelectPost}
          onNavigateHome={() => navigate('home')}
        />
      );
    }

    // 3. Loading State: Gate all public views while initial data is being fetched
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    // 4. Error State: If Firestore or data load failed, display DataErrorState with retry option
    if (dataError) {
      return (
        <DataErrorState
          message={dataError}
          onRetry={() => refreshData(Boolean(currentUser))}
        />
      );
    }

    // 5. Home View
    if (currentRoute === 'home' || currentRoute === '') {
      return (
        <HomeView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          importantLinks={importantLinks}
          settings={settings}
          homepageSections={homepageSections}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 2. Job or Post Single Article View (/job/:slug or /post/:slug - Requirement #9)
    if (currentRoute.startsWith('job/') || currentRoute.startsWith('post/')) {
      const slug = currentRoute.replace(/^(job|post)\//, '');
      const post = posts.find(p => p.slug === slug || p.id === slug);
      if (!post) {
        return (
          <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">विज्ञप्ति नहीं मिली (Post Not Found)</h2>
            <p className="text-xs text-slate-500 mt-2">
              संभवतः यह पोस्ट हटा दी गई है या लिंक अमान्य है।
            </p>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="mt-4 px-4 py-2 bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              होमपेज पर वापस जाएं
            </button>
          </div>
        );
      }

      const relatedPosts = publishedPosts.filter(p => p.id !== post.id && p.categoryId === post.categoryId);

      return (
        <JobDetailView
          post={post}
          relatedPosts={relatedPosts}
          categories={categories}
          adSlots={adSlots}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 3. Jobs Listing View
    if (currentRoute === 'jobs') {
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="job"
          pageTitle="मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Jobs 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 4. Admit Cards Listing
    if (currentRoute === 'admit-cards') {
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="admit_card"
          pageTitle="मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 5. Results Listing
    if (currentRoute === 'results') {
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="result"
          pageTitle="मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Results 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 6. Answer Keys Listing
    if (currentRoute === 'answer-keys') {
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="answer_key"
          pageTitle="मध्य प्रदेश उत्तर कुंजी (MP Answer Key 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 7. Dedicated Category Pages (/category/:slug - Requirement #8)
    if (currentRoute.startsWith('category/')) {
      const catSlug = currentRoute.replace('category/', '');
      const cat = categories.find(c => c.slug === catSlug || c.id === catSlug);
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialCategorySlug={cat?.id || catSlug}
          pageTitle={`${cat?.nameHindi || 'श्रेणी'} भर्ती एवं परीक्षा अपडेट 2026`}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 7b. Dedicated Tag Pages (/tag/:slug or /tag/:name)
    if (currentRoute.startsWith('tag/')) {
      const rawTag = decodeURIComponent(currentRoute.replace('tag/', ''));
      const matchedTag = tags.find(t => t.slug.toLowerCase() === rawTag.toLowerCase() || t.name.toLowerCase() === rawTag.toLowerCase());
      const displayTagName = matchedTag ? matchedTag.name : rawTag;
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          initialTag={displayTagName}
          pageTitle={`#${displayTagName} - संबंधित सरकारी नौकरियां एवं परीक्षा अपडेट`}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 8. Categories Hub
    if (currentRoute === 'categories') {
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          pageTitle="समस्त श्रेणियां एवं विभाग (All MP Recruitment Categories)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 8b. Search Page (/search)
    if (currentRoute === 'search') {
      const searchParams = new URLSearchParams(location.search);
      const queryParam = searchParams.get('q') || '';
      return (
        <JobsListView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          pageTitle={queryParam ? `खोज परिणाम: "${queryParam}"` : "समस्त सरकारी नौकरियां एवं खोज"}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    // 9. Static / Legal Pages (Requirement #22)
    if (['about', 'contact', 'privacy-policy', 'terms-and-conditions', 'disclaimer', 'advertisement'].includes(currentRoute)) {
      return (
        <StaticPageView
          pageType={currentRoute as any}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    // 10. Sitemap (Requirement #15)
    if (currentRoute === 'sitemap' || currentRoute === 'sitemap.xml') {
      return (
        <SitemapView
          posts={publishedPosts}
          categories={categories}
          onNavigate={navigate}
        />
      );
    }

    // Default Fallback
    return (
      <HomeView
        posts={publishedPosts}
        categories={categories}
        adSlots={adSlots}
        importantLinks={importantLinks}
        settings={settings}
        homepageSections={homepageSections}
        onNavigate={navigate}
        onSelectPost={handleSelectPost}
      />
    );
  };

  // If viewing admin dashboard while authenticated, render full-screen admin experience
  if (currentRoute === 'admin' && currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
        {renderCurrentView()}
      </div>
    );
  }

  // If viewing reset password, render full-screen secure experience
  if (currentRoute === 'reset-password') {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100">
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white max-w-full overflow-x-hidden">
      {/* Top Ticker Alert Bar (Requirement #20) */}
      <AnnouncementBar
        settings={settings}
        onNavigate={navigate}
      />

      {/* Main Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
        categories={categories}
        isAdminLoggedIn={Boolean(currentUser)}
      />

      {/* Main Content Area */}
      <div className="flex-1 py-4 sm:py-6">
        {renderCurrentView()}
      </div>

      {/* Footer */}
      <Footer
        settings={settings}
        categories={categories}
        importantLinks={importantLinks}
        onNavigate={navigate}
      />

      {/* Global Interactive Search Modal (Ctrl + K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={publishedPosts}
        onSelectPost={handleSelectPost}
      />
    </div>
  );
}
