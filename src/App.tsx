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
  getDemoAdminUser,
  setDemoAdminUser,
  resetToSampleData,
  seedInitialDataToFirestore,
  INITIAL_HOMEPAGE_SECTIONS
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
import { AdminLoginView } from './components/admin/AdminLoginView';
import { INITIAL_POSTS, INITIAL_CATEGORIES, INITIAL_AD_SLOTS, INITIAL_IMPORTANT_LINKS, INITIAL_SITE_SETTINGS } from './data/initialData';

export default function App() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [tags, setTags] = useState<Tag[]>([]);
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(INITIAL_AD_SLOTS);
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>(INITIAL_IMPORTANT_LINKS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [homepageSections, setHomepageSections] = useState<HomepageSectionsConfig>(INITIAL_HOMEPAGE_SECTIONS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getDemoAdminUser());
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all CMS data
  const refreshData = useCallback(async () => {
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
        getPosts(),
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
            role: 'admin',
            isAdmin: true
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

  const handleSaveHomepageSections = async (sections: HomepageSectionsConfig) => {
    const saved = await saveHomepageSections(sections);
    setHomepageSections(saved);
  };

  const handleResetData = () => {
    resetToSampleData();
    refreshData();
  };

  const handleSeedData = async () => {
    await seedInitialDataToFirestore();
    await refreshData();
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
    // 1. Home View
    if (currentRoute === 'home' || currentRoute === '') {
      return (
        <HomeView
          posts={publishedPosts}
          categories={categories}
          adSlots={adSlots}
          importantLinks={importantLinks}
          settings={settings}
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

    // 11. Admin Panel / Admin Login (Requirement #2 & #3)
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

    // Default Fallback
    return (
      <HomeView
        posts={publishedPosts}
        categories={categories}
        adSlots={adSlots}
        importantLinks={importantLinks}
        settings={settings}
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
