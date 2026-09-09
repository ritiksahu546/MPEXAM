import React, { useState, useMemo } from 'react';
import { 
  Post, 
  Category, 
  Tag,
  AdSlotConfig, 
  ImportantLink, 
  SiteSettings, 
  UserProfile,
  HomepageSectionsConfig 
} from '../../types';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Tag as TagIcon, 
  Image as ImageIcon, 
  Megaphone, 
  Home as HomeIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  X, 
  Menu,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Database,
  ShieldCheck
} from 'lucide-react';
import { PostFormModal } from './PostFormModal';
import { CategoryManager } from './CategoryManager';
import { TagManager } from './TagManager';
import { AdManager } from './AdManager';
import { HomepageManager } from './HomepageManager';
import { MediaManager } from './MediaManager';
import { SettingsManager } from './SettingsManager';
import { isFirebaseConfigured, testFirebaseConnection } from '../../services/firebase';

interface Props {
  posts: Post[];
  categories: Category[];
  tags?: Tag[];
  adSlots: AdSlotConfig[];
  importantLinks: ImportantLink[];
  settings: SiteSettings;
  homepageSections?: HomepageSectionsConfig;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onSavePost: (post: Post) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveTag?: (tag: Tag) => Promise<void>;
  onDeleteTag?: (tagId: string) => Promise<void>;
  onUpdateAdSlot: (slot: AdSlotConfig) => Promise<void>;
  onSaveImportantLink: (link: ImportantLink) => Promise<void>;
  onDeleteImportantLink: (linkId: string) => Promise<void>;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onSaveHomepageSections?: (sections: HomepageSectionsConfig) => Promise<void>;
  onResetData: () => void;
  onSeedData?: () => Promise<void>;
  onViewPost: (slug: string) => void;
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  posts,
  categories,
  tags = [],
  adSlots,
  importantLinks,
  settings,
  homepageSections = {
    featuredPosts: true,
    latestPosts: true,
    trendingPosts: true,
    importantLinks: true,
    announcementBar: true,
    quickCategoryGrid: true
  },
  currentUser,
  onLogout,
  onSavePost,
  onDeletePost,
  onSaveCategory,
  onDeleteCategory,
  onSaveTag,
  onDeleteTag,
  onUpdateAdSlot,
  onSaveSettings,
  onSaveHomepageSections,
  onSeedData,
  onViewPost,
  onNavigateHome
}) => {
  // Navigation tabs (Requirement #3)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'posts' | 'categories' | 'tags' | 'media' | 'ads' | 'homepage' | 'settings'
  >('dashboard');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Post editor modal state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Posts list filter & search state
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Metrics (Requirement #3)
  const totalPostsCount = posts.length;
  const publishedPostsCount = posts.filter(p => p.status === 'published').length;
  const draftPostsCount = posts.filter(p => p.status === 'draft').length;
  const totalCategoriesCount = categories.length;
  const totalViewsCount = useMemo(() => {
    return posts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  }, [posts]);

  // Filtered posts for Posts CMS tab
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = 
        !postSearchQuery ||
        p.title.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
        (p.titleHindi && p.titleHindi.toLowerCase().includes(postSearchQuery.toLowerCase())) ||
        (p.organization && p.organization.toLowerCase().includes(postSearchQuery.toLowerCase()));

      const matchesCat = 
        postCategoryFilter === 'all' || 
        p.categoryId === postCategoryFilter;

      const matchesStatus = 
        postStatusFilter === 'all' || 
        p.status === postStatusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [posts, postSearchQuery, postCategoryFilter, postStatusFilter]);

  // Handlers
  const handleOpenNewPost = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleTogglePublish = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    const updated: Post = {
      ...post,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      ...(nextStatus === 'published'
        ? { publishedAt: post.publishedAt || new Date().toISOString() }
        : post.publishedAt
          ? { publishedAt: post.publishedAt }
          : {})
    };
    if (!updated.publishedAt) {
      delete (updated as any).publishedAt;
    }
    try {
      await onSavePost(updated);
      showToast(`पोस्ट "${post.title.slice(0, 25)}..." अब ${nextStatus === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'} है।`);
    } catch (err: any) {
      alert('त्रुटि: ' + err.message);
    }
  };

  const handleDeletePostConfirm = async (post: Post) => {
    if (confirm(`क्या आप निश्चित रूप से पोस्ट "${post.title}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`)) {
      try {
        await onDeletePost(post.id);
        showToast('पोस्ट सफलतापूर्वक हटा दी गई।');
      } catch (err: any) {
        alert('हटाने में त्रुटि: ' + err.message);
      }
    }
  };

  const handleSavePostWrapper = async (saved: Post) => {
    await onSavePost(saved);
    showToast('विज्ञप्ति सफलतापूर्वक सहेजी गई!');
  };

  const navItems: { id: typeof activeTab; label: string; icon: any; count?: number }[] = [
    { id: 'dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
    { id: 'posts', label: 'विज्ञप्तियां (Posts CMS)', icon: FileText, count: totalPostsCount },
    { id: 'categories', label: 'श्रेणियां (Categories)', icon: Layers, count: totalCategoriesCount },
    { id: 'tags', label: 'टैग्स (Tags)', icon: TagIcon, count: tags.length },
    { id: 'media', label: 'मीडिया व फाइल्स (Media)', icon: ImageIcon },
    { id: 'ads', label: 'विज्ञापन (Advertisements)', icon: Megaphone },
    { id: 'homepage', label: 'होमपेज लेआउट (Homepage)', icon: HomeIcon },
    { id: 'settings', label: 'सेटिंग्स व SEO (Settings)', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-70 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm tracking-tight">{settings.siteName} CMS</span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg"
            >
              साइट देखें ↗
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-red-400 hover:text-red-300 p-1"
            title="लॉगआउट"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar (Requirement #3) */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-transform md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                MP
              </div>
              <div>
                <h1 className="font-black text-sm text-white tracking-tight leading-none">
                  {settings.siteName}
                </h1>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Admin Control Panel</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge */}
          <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="text-[11px] text-slate-400">लॉगिन यूजर:</p>
              <p className="font-bold text-slate-200 truncate max-w-[130px]">
                {currentUser?.email || currentUser?.displayName || 'Super Admin'}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>पब्लिक वेबसाइट खोलें</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>सुरक्षित लॉगआउट (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Firebase Config Notice if offline/unconfigured */}
        {!isFirebaseConfigured && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Firebase Local Fallback Active:</span> पर्यावरण चर अनुपलब्ध होने के कारण पोर्टल वर्तमान में लोकल स्टोरेज में सक्रिय रूप से चल रहा है।
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Stat Cards (Requirement #3) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total Posts */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">कुल विज्ञप्तियां</span>
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalPostsCount}</div>
                <div className="text-[10px] text-slate-400 mt-1">सभी श्रेणी की पोस्ट्स</div>
              </div>

              {/* Published Posts */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
                <div className="flex items-center justify-between text-emerald-700 mb-2">
                  <span className="text-xs font-bold">प्रकाशित पोस्ट्स</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">{publishedPostsCount}</div>
                <div className="text-[10px] text-slate-400 mt-1">पब्लिक को दृश्यमान</div>
              </div>

              {/* Draft Posts */}
              <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
                <div className="flex items-center justify-between text-amber-700 mb-2">
                  <span className="text-xs font-bold">ड्राफ्ट पोस्ट्स</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-amber-700">{draftPostsCount}</div>
                <div className="text-[10px] text-slate-400 mt-1">अप्रकाशित विवरण</div>
              </div>

              {/* Total Categories */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">कुल श्रेणियां</span>
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalCategoriesCount}</div>
                <div className="text-[10px] text-slate-400 mt-1">विभाग एवं बोर्ड्स</div>
              </div>

              {/* Total Views */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">कुल पाठक व्यूज</span>
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{totalViewsCount.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">आर्टिकल पेज व्यूज</div>
              </div>
            </div>

            {/* Quick Actions & Recent Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Recent Published Posts */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-sm text-slate-800">हालिया विज्ञप्तियां (Recent Posts)</h3>
                    <p className="text-xs text-slate-400">नवीनतम अपडेट एवं स्थिति</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    className="text-xs text-blue-700 font-bold hover:underline"
                  >
                    सभी देखें →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {posts.slice(0, 5).map(post => (
                    <div key={post.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="truncate flex-1">
                        <div className="font-bold text-slate-900 truncate">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-blue-700 font-semibold">{post.categoryName || post.category}</span>
                          <span>•</span>
                          <span>{post.vacancy || 'विज्ञप्ति'}</span>
                          <span>•</span>
                          <span>{post.viewCount || 0} व्यूज</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {post.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEditPost(post)}
                          className="p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
                          title="संपादित करें"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Quick Admin Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <h3 className="font-black text-sm text-slate-800">त्वरित कार्य (Quick Actions)</h3>

                <button
                  type="button"
                  onClick={handleOpenNewPost}
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>नई विज्ञप्ति बनाएं (Create Post)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>श्रेणियां प्रबंधित करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ads')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Megaphone className="w-4 h-4 text-amber-600" />
                  <span>विज्ञापन एवं AdSense</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('homepage')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <HomeIcon className="w-4 h-4 text-emerald-600" />
                  <span>होमपेज लेआउट टॉगल</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: POSTS CMS (Requirement #4) */}
        {activeTab === 'posts' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <span>विज्ञप्ति प्रबंधन (Posts CMS)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  मध्य प्रदेश की सभी सरकारी भर्तियों, परिणामों एवं प्रवेश पत्रों का सम्पूर्ण CRUD नियंत्रण
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewPost}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>नई विज्ञप्ति जोड़ें</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={postSearchQuery}
                  onChange={e => setPostSearchQuery(e.target.value)}
                  placeholder="शीर्षक, पद अथवा विभाग से खोजें..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500">श्रेणी:</span>
                <select
                  value={postCategoryFilter}
                  onChange={e => setPostCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="all">सभी श्रेणियां</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nameHindi}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-500">स्थिति:</span>
                <select
                  value={postStatusFilter}
                  onChange={e => setPostStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="all">सभी ({posts.length})</option>
                  <option value="published">प्रकाशित ({publishedPostsCount})</option>
                  <option value="draft">ड्राफ्ट ({draftPostsCount})</option>
                </select>
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-3">शीर्षक व विवरण (Title / Department)</th>
                      <th className="p-3">श्रेणी (Category)</th>
                      <th className="p-3">अंतिम तिथि (Last Date)</th>
                      <th className="p-3 text-center">व्यूज (Views)</th>
                      <th className="p-3 text-center">स्थिति (Status)</th>
                      <th className="p-3 text-right">कार्य (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 max-w-sm">
                          <div className="font-bold text-slate-900 leading-snug truncate" title={post.title}>
                            {post.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {post.organization} • {post.vacancy || 'पद उपलब्ध'}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold">
                            {post.categoryName || post.category}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap font-semibold text-red-600">
                          {post.applicationLastDate || 'शीघ्र'}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap font-mono text-slate-600">
                          {post.viewCount || 0}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(post)}
                            title="क्लिक कर स्थिति बदलें"
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 cursor-pointer ${
                              post.status === 'published'
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                            }`}
                          >
                            {post.status === 'published' ? '🟢 प्रकाशित' : '🟡 ड्राफ्ट'}
                          </button>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewPost(post.slug || post.id)}
                              title="पब्लिक पेज देखें"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditPost(post)}
                              title="संपादित करें"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePostConfirm(post)}
                              title="हटाएं"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredPosts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          कोई विज्ञप्ति नहीं मिली। फिल्टर बदलें अथवा "नई विज्ञप्ति जोड़ें" पर क्लिक करें।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onSaveCategory={onSaveCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}

        {/* TAB 4: TAGS */}
        {activeTab === 'tags' && onSaveTag && onDeleteTag && (
          <TagManager
            tags={tags}
            onSaveTag={onSaveTag}
            onDeleteTag={onDeleteTag}
          />
        )}

        {/* TAB 5: MEDIA */}
        {activeTab === 'media' && (
          <MediaManager />
        )}

        {/* TAB 6: ADS */}
        {activeTab === 'ads' && (
          <AdManager
            adSlots={adSlots}
            onSaveAdSlot={onUpdateAdSlot}
          />
        )}

        {/* TAB 7: HOMEPAGE */}
        {activeTab === 'homepage' && onSaveHomepageSections && (
          <HomepageManager
            sections={homepageSections}
            settings={settings}
            onSaveSections={onSaveHomepageSections}
            onSaveSettings={onSaveSettings}
          />
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsManager
            settings={settings}
            onSaveSettings={onSaveSettings}
            onSeedData={onSeedData}
          />
        )}

      </main>

      {/* Full CRUD Post Modal */}
      {isEditorOpen && (
        <PostFormModal
          post={editingPost}
          categories={categories}
          availableTags={tags}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSavePostWrapper}
        />
      )}

    </div>
  );
};
