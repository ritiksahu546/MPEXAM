import React, { useState, useEffect, useCallback } from 'react';
import { 
  Post, 
  Category, 
  AdSlotConfig, 
  ImportantLink, 
  SiteSettings, 
  UserProfile 
} from './types';
import { 
  getPosts, 
  getCategories, 
  getAdSlots, 
  getImportantLinks, 
  getSettings,
  savePost,
  deletePost,
  incrementPostViews,
  saveCategory,
  deleteCategory,
  updateAdSlot,
  saveImportantLink,
  deleteImportantLink,
  updateSettings,
  getDemoAdminUser,
  setDemoAdminUser,
  resetToSampleData
} from './services/storage';
import { onAuthStateChanged, auth, logOut, testFirebaseConnection } from './services/firebase';

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
import { INITIAL_POSTS, INITIAL_CATEGORIES, INITIAL_AD_SLOTS, INITIAL_IMPORTANT_LINKS, INITIAL_SITE_SETTINGS } from './data/initialData';

export default function App() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(INITIAL_AD_SLOTS);
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>(INITIAL_IMPORTANT_LINKS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getDemoAdminUser());
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data
  const refreshData = useCallback(async () => {
    try {
      const [fetchedPosts, fetchedCats, fetchedAds, fetchedLinks, fetchedSettings] = await Promise.all([
        getPosts(),
        getCategories(),
        getAdSlots(),
        getImportantLinks(),
        getSettings()
      ]);
      setPosts(fetchedPosts);
      setCategories(fetchedCats);
      setAdSlots(fetchedAds);
      setImportantLinks(fetchedLinks);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    testFirebaseConnection();
    refreshData();

    // Listen to Firebase Auth state if available
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Admin',
            role: 'admin'
          });
        }
      });
      return () => unsubscribe();
    }
  }, [refreshData]);

  // URL Hash Sync for routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      setCurrentRoute(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (slug: string) => {
    incrementPostViews(slug);
    navigate(`job/${slug}`);
  };

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

  const handleUpdateAdSlot = async (slot: AdSlotConfig) => {
    await updateAdSlot(slot);
    setAdSlots(prev => prev.map(s => s.slotKey === slot.slotKey ? slot : s));
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

  const handleResetData = () => {
    resetToSampleData();
    refreshData();
  };

  const handleLogin = (user: UserProfile) => {
    setDemoAdminUser(user);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    setDemoAdminUser(null);
    setCurrentUser(null);
    await logOut();
  };

  // Route Dispatcher
  const renderCurrentView = () => {
    if (currentRoute === 'home' || currentRoute === '') {
      return (
        <HomeView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          importantLinks={importantLinks}
          settings={settings}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute.startsWith('job/')) {
      const slug = currentRoute.replace('job/', '');
      const post = posts.find(p => p.slug === slug || p.id === slug);
      if (!post) {
        return (
          <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">विज्ञप्ति नहीं मिली (Post Not Found)</h2>
            <p className="text-xs text-slate-500 mt-2">
              संभवतः यह पोस्ट हटा दी गई है या लिंक अमान्य है।
            </p>
            <button
              onClick={() => navigate('home')}
              className="mt-4 px-4 py-2 bg-blue-700 text-white font-bold text-xs rounded-lg"
            >
              होमपेज पर वापस जाएं
            </button>
          </div>
        );
      }

      const relatedPosts = posts.filter(p => p.id !== post.id && p.categoryId === post.categoryId);

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

    if (currentRoute === 'jobs') {
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="job"
          pageTitle="मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Jobs 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute === 'admit-cards') {
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="admit_card"
          pageTitle="मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute === 'results') {
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="result"
          pageTitle="मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Results 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute === 'answer-keys') {
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          initialPostType="answer_key"
          pageTitle="मध्य प्रदेश उत्तर कुंजी (MP Answer Key 2026)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute.startsWith('category/')) {
      const catSlug = currentRoute.replace('category/', '');
      const cat = categories.find(c => c.slug === catSlug || c.id === catSlug);
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          initialCategorySlug={cat?.id || catSlug}
          pageTitle={`${cat?.nameHindi || 'श्रेणी'} भर्ती एवं परीक्षा अपडेट 2026`}
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (currentRoute === 'categories') {
      return (
        <JobsListView
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          pageTitle="समस्त श्रेणियां एवं विभाग (All MP Recruitment Categories)"
          onNavigate={navigate}
          onSelectPost={handleSelectPost}
        />
      );
    }

    if (['about', 'contact', 'privacy-policy', 'terms-and-conditions', 'disclaimer', 'advertisement'].includes(currentRoute)) {
      return (
        <StaticPageView
          pageType={currentRoute as any}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute === 'sitemap') {
      return (
        <SitemapView
          posts={posts}
          categories={categories}
          onNavigate={navigate}
        />
      );
    }

    if (currentRoute === 'admin') {
      return (
        <AdminDashboard
          posts={posts}
          categories={categories}
          adSlots={adSlots}
          importantLinks={importantLinks}
          settings={settings}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSavePost={handleSavePost}
          onDeletePost={handleDeletePost}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onUpdateAdSlot={handleUpdateAdSlot}
          onSaveImportantLink={handleSaveImportantLink}
          onDeleteImportantLink={handleDeleteImportantLink}
          onSaveSettings={handleSaveSettings}
          onResetData={handleResetData}
          onViewPost={handleSelectPost}
        />
      );
    }

    return (
      <HomeView
        posts={posts}
        categories={categories}
        adSlots={adSlots}
        importantLinks={importantLinks}
        settings={settings}
        onNavigate={navigate}
        onSelectPost={handleSelectPost}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Ticker Alert Bar */}
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
        onNavigate={navigate}
      />

      {/* Global Interactive Search Modal (Ctrl + K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posts={posts}
        onSelectPost={handleSelectPost}
      />
    </div>
  );
}
