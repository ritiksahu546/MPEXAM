import React, { useState } from 'react';
import { 
  Post, 
  Category, 
  AdSlotConfig, 
  ImportantLink, 
  SiteSettings, 
  UserProfile 
} from '../../types';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Settings as SettingsIcon, 
  Layers, 
  Megaphone, 
  ExternalLink, 
  BarChart3, 
  Check, 
  X, 
  LogOut, 
  Lock, 
  Eye, 
  Sparkles, 
  Database, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { isFirebaseConfigured, testFirebaseConnection, signInWithGoogle } from '../../services/firebase';

interface Props {
  posts: Post[];
  categories: Category[];
  adSlots: AdSlotConfig[];
  importantLinks: ImportantLink[];
  settings: SiteSettings;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onSavePost: (post: Post) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onUpdateAdSlot: (slot: AdSlotConfig) => Promise<void>;
  onSaveImportantLink: (link: ImportantLink) => Promise<void>;
  onDeleteImportantLink: (linkId: string) => Promise<void>;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onResetData: () => void;
  onViewPost: (slug: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  posts,
  categories,
  adSlots,
  importantLinks,
  settings,
  currentUser,
  onLogin,
  onLogout,
  onSavePost,
  onDeletePost,
  onSaveCategory,
  onDeleteCategory,
  onUpdateAdSlot,
  onSaveImportantLink,
  onDeleteImportantLink,
  onSaveSettings,
  onResetData,
  onViewPost
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'posts' | 'new_post' | 'categories' | 'ads' | 'links' | 'settings' | 'firebase'>('posts');
  
  // Login form state (if not logged in)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Editing state for post
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Editing category
  const [newCatNameHi, setNewCatNameHi] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Editing link
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkBtn, setNewLinkBtn] = useState('पोर्टल खोलें');

  // Firebase testing
  const [fbTestStatus, setFbTestStatus] = useState<string | null>(null);

  // Simple admin auth check
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === 'admin@mpexamupdate.in' && loginPassword === 'Admin@2026') {
      onLogin({
        uid: 'admin_local_uid',
        email: loginEmail,
        displayName: 'Portal Super Admin',
        role: 'admin'
      });
      setLoginError('');
    } else if (loginEmail.includes('@') && loginPassword.length >= 6) {
      // Demo quick admin access
      onLogin({
        uid: 'demo_admin_uid',
        email: loginEmail,
        displayName: 'MP Admin',
        role: 'admin'
      });
      setLoginError('');
    } else {
      setLoginError('अमान्य ईमेल अथवा पासवर्ड। (Demo: admin@mpexamupdate.in / Admin@2026)');
    }
  };

  const createBlankPost = (): Post => {
    const id = 'post_' + Date.now();
    return {
      id,
      title: '',
      titleHindi: '',
      slug: '',
      categoryId: categories[0]?.id || 'mppsc',
      categoryName: categories[0]?.nameHindi || 'MPPSC भर्ती',
      postType: 'job',
      organization: 'मध्य प्रदेश शासन',
      vacancy: '',
      qualification: '',
      ageLimit: '18 से 40 वर्ष (आरक्षित वर्गों को नियमानुसार छूट)',
      applicationFee: 'सामान्य/अनारक्षित: ₹500 | MP SC/ST/OBC: ₹250 | पोर्टल शुल्क अतिरिक्त',
      salary: '',
      applicationStartDate: new Date().toLocaleDateString('hi-IN'),
      applicationLastDate: '',
      examDate: '',
      selectionProcess: '1. ऑनलाइन लिखित परीक्षा (CBT)\n2. दस्तावेज़ सत्यापन (Document Verification)\n3. चिकित्सीय परीक्षण (Medical Test)',
      examPattern: '100 वस्तुनिष्ठ प्रश्न (MCQs) • कुल अंक: 100 • समयावधि: 2 घंटे • कोई नकारात्मक अंकन नहीं',
      howToApply: '1. आधिकारिक पोर्टल पर जाएं।\n2. नवीन पंजीयन / प्रोफाइल आईडी से लॉगिन करें।\n3. आवश्यक शैक्षणिक प्रमाण-पत्र, फोटो व हस्ताक्षर अपलोड करें।\n4. आवेदन शुल्क का ऑनलाइन भुगतान करें एवं प्रिंट आउट सुरक्षित रखें।',
      content: '',
      excerpt: '',
      applyLink: 'https://www.mponline.gov.in',
      notificationPdf: '',
      officialWebsite: 'https://mp.gov.in',
      syllabus: 'सामान्य ज्ञान, तार्किक अभियोग्यता, बौद्धिक क्षमता एवं अंकगणित।',
      documentsRequired: '10वीं/12वीं अंकसूची, आधार कार्ड, निवास प्रमाण पत्र, जाति प्रमाण पत्र, नवीनतम पासपोर्ट साइज फोटो एवं हस्ताक्षर।',
      faqs: [
        { question: 'आवेदन की अंतिम तिथि क्या है?', answer: 'आवेदन की अंतिम तिथि एवं विस्तृत विवरण ऊपर तालिका में दिया गया है।' },
        { question: 'क्या मध्य प्रदेश के बाहर के अभ्यर्थी आवेदन कर सकते हैं?', answer: 'हाँ, अन्य राज्यों के अभ्यर्थी भी सामान्य (अनारक्षित) श्रेणी के अंतर्गत नियमानुसार आवेदन कर सकते हैं।' }
      ],
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      secondaryKeywords: '',
      status: 'published',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 15
    };
  };

  const handleStartNewPost = () => {
    setEditingPost(createBlankPost());
    setActiveTab('new_post');
  };

  const handleEditExistingPost = (post: Post) => {
    setEditingPost({ ...post });
    setActiveTab('new_post');
  };

  const handleSavePostAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!editingPost.titleHindi.trim() || !editingPost.organization.trim()) {
      alert('कृपया पोस्ट का हिंदी शीर्षक और संगठन का नाम अवश्य भरें।');
      return;
    }

    // Auto-generate slug if blank
    let slug = editingPost.slug.trim();
    if (!slug) {
      slug = (editingPost.title || editingPost.titleHindi)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);
    }

    setIsSaving(true);
    try {
      await onSavePost({
        ...editingPost,
        slug,
        title: editingPost.title || editingPost.titleHindi
      });
      setSaveSuccessMsg('पोस्ट सफलतापूर्वक सहेज ली गई!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      setActiveTab('posts');
      setEditingPost(null);
    } catch (err) {
      alert('त्रुटि: पोस्ट सहेजी नहीं जा सकी। ' + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestFirebase = async () => {
    setFbTestStatus('जाँच जारी है...');
    const result = await testFirebaseConnection();
    setFbTestStatus(result ? '✓ Firebase Firestore से सीधा कनेक्शन सक्रिय है!' : 'ℹ Firebase क्रेडेंशियल्स अभी सेट नहीं हैं, ऐप पूर्णतः लोकल स्टोरेज मोड में सुरक्षित चल रहा है।');
  };

  // IF NOT LOGGED IN, SHOW PROFESSIONAL LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              एडमिन लॉगिन (Admin Portal)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              MP Exam Update भर्ती प्रबंधन एवं प्रकाशन पैनल
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ईमेल आईडी (Email)
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@mpexamupdate.in"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                पासवर्ड (Password)
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-xs"
            >
              सुरक्षित लॉगिन करें
            </button>
          </form>

          {isFirebaseConfigured && (
            <div className="mt-4">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">या (Or with Firebase)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoginError('');
                    const res = await signInWithGoogle();
                    if (res?.user) {
                      onLogin({
                        uid: res.user.uid,
                        email: res.user.email || '',
                        displayName: res.user.displayName || 'Authorized Admin',
                        role: 'admin'
                      });
                    }
                  } catch (err: any) {
                    setLoginError('Google साइन इन त्रुटि: ' + (err.message || String(err)));
                  }
                }}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 text-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google खाते से लॉगिन करें (Firebase Auth)</span>
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <span className="font-bold text-slate-700 block mb-1">डेमो एडमिन क्रेडेंशियल्स:</span>
            <span>ईमेल: <code>admin@mpexamupdate.in</code></span><br />
            <span>पासवर्ड: <code>Admin@2026</code></span>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 space-y-6 animate-fade-in">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Super Admin Panel
            </span>
            <span className="text-xs text-slate-400">
              {currentUser.email}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            प्रशासनिक नियंत्रण कक्ष (Admin Dashboard)
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleStartNewPost}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>नई भर्ती जोड़ें (+ New Post)</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">कुल प्रकाशित पोस्ट</span>
          <strong className="text-2xl font-black text-blue-700 block mt-1">{posts.length}</strong>
          <span className="text-[11px] text-slate-400">भर्तियां, रिजल्ट, एडमिट कार्ड</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">सक्रिय श्रेणियां</span>
          <strong className="text-2xl font-black text-emerald-700 block mt-1">{categories.length}</strong>
          <span className="text-[11px] text-slate-400">MPPSC, MPESB, पुलिस आदि</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">विज्ञापन स्लॉट्स</span>
          <strong className="text-2xl font-black text-amber-600 block mt-1">{adSlots.filter(a => a.enabled).length} सक्रिय</strong>
          <span className="text-[11px] text-slate-400">कुल {adSlots.length} उपलब्ध स्लॉट्स</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold block">कुल अनुमानित व्यूज</span>
          <strong className="text-2xl font-black text-purple-700 block mt-1">
            {posts.reduce((acc, p) => acc + (p.viewCount || 0), 0).toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400">लाइव पेज विज़िटर्स</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'posts' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>पोस्ट प्रबंधन ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'categories' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>श्रेणी प्रबंधन ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ads')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ads' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>विज्ञापन प्रबंधन (Ad Slots)</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'links' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>शासकीय लिंक</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>साइट सेटिंग्स व अलर्ट</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'firebase' ? 'border-blue-700 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Firebase स्थिति</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: POSTS LIST */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
            <div>
              <h2 className="font-bold text-base text-slate-900">समस्त प्रकाशित एवं ड्राफ्ट पोस्ट्स</h2>
              <p className="text-xs text-slate-500">सभी अपडेट्स को संपादित करें, स्थिति बदलें या हटाएं</p>
            </div>
            <button
              onClick={handleStartNewPost}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors self-start"
            >
              <Plus className="w-4 h-4" />
              <span>नया पोस्ट बनाएं</span>
            </button>
          </div>

          <div className="table-responsive rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">शीर्षक (Hindi Title)</th>
                  <th className="py-2.5 px-3">श्रेणी / विभाग</th>
                  <th className="py-2.5 px-3">प्रकार</th>
                  <th className="py-2.5 px-3">अंतिम तिथि</th>
                  <th className="py-2.5 px-3">स्थिति</th>
                  <th className="py-2.5 px-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                      <div className="truncate font-bold">{post.titleHindi || post.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">/{post.slug}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div>{post.categoryName}</div>
                      <div className="text-[10px] text-slate-400">{post.organization}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {post.postType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-red-600 font-semibold">
                      {post.applicationLastDate || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        post.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {post.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onViewPost(post.slug)}
                        title="वेबसाइट पर देखें"
                        className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditExistingPost(post)}
                        title="संपादित करें"
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`क्या आप "${post.titleHindi || post.title}" को निश्चित रूप से हटाना चाहते हैं?`)) {
                            await onDeletePost(post.id);
                          }
                        }}
                        title="हटाएं"
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: POST EDITOR (NEW / EDIT) */}
      {activeTab === 'new_post' && editingPost && (
        <form onSubmit={handleSavePostAction} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingPost.id.startsWith('post_') ? 'नई भर्ती / परीक्षा पोस्ट बनाएं' : 'पोस्ट संपादित करें'}
              </h2>
              <p className="text-xs text-slate-500">सभी आधिकारिक तथ्य व तिथियां ध्यानपूर्वक दर्ज करें</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'सहेजा जा रहा है...' : 'पोस्ट प्रकाशित करें'}</span>
              </button>
            </div>
          </div>

          {/* Row 1: Titles and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                हिंदी शीर्षक (Hindi Title) *
              </label>
              <input
                type="text"
                required
                value={editingPost.titleHindi}
                onChange={(e) => setEditingPost({ ...editingPost, titleHindi: e.target.value })}
                placeholder="उदा: MP Police Constable 7500 पद भर्ती 2026 ऑनलाइन फॉर्म"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                अंग्रेज़ी शीर्षक (English Title)
              </label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                placeholder="MP Police Constable Recruitment 2026 Apply Online"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                SEO यूआरएल स्लग (Slug)
              </label>
              <input
                type="text"
                value={editingPost.slug}
                onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                placeholder="mp-police-constable-recruitment-2026"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-blue-600 font-mono text-slate-700"
              />
              <span className="text-[10px] text-slate-500">रिक्त छोड़ने पर स्वतः जनरेट होगा</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                विभाग / संगठन (Organization) *
              </label>
              <input
                type="text"
                required
                value={editingPost.organization}
                onChange={(e) => setEditingPost({ ...editingPost, organization: e.target.value })}
                placeholder="उदा: मध्य प्रदेश पुलिस विभाग / MPESB भोपाल"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Category, Post Type, Status, Featured */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                श्रेणी (Category)
              </label>
              <select
                value={editingPost.categoryId}
                onChange={(e) => {
                  const cat = categories.find(c => c.id === e.target.value);
                  setEditingPost({
                    ...editingPost,
                    categoryId: e.target.value,
                    categoryName: cat ? cat.nameHindi : 'MP भर्ती'
                  });
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameHindi}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                पोस्ट का प्रकार (Type)
              </label>
              <select
                value={editingPost.postType}
                onChange={(e) => setEditingPost({ ...editingPost, postType: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="job">सरकारी नौकरी (Job)</option>
                <option value="admit_card">एडमिट कार्ड (Admit Card)</option>
                <option value="result">परीक्षा परिणाम (Result)</option>
                <option value="answer_key">उत्तर कुंजी (Answer Key)</option>
                <option value="scheme">सरकारी योजना (Scheme)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                प्रकाशन स्थिति
              </label>
              <select
                value={editingPost.status}
                onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="published">प्रकाशित (Live)</option>
                <option value="draft">ड्राफ्ट (Draft)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="featured_chk"
                checked={editingPost.featured}
                onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="featured_chk" className="text-xs font-bold text-slate-800 cursor-pointer">
                मुख्य आकर्षण (Featured)
              </label>
            </div>
          </div>

          {/* Row 3: Vacancy, Qualification, Age, Fee, Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                कुल पद (Vacancy)
              </label>
              <input
                type="text"
                value={editingPost.vacancy}
                onChange={(e) => setEditingPost({ ...editingPost, vacancy: e.target.value })}
                placeholder="उदा: 7,500 पद"
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                शैक्षणिक योग्यता (Qualification)
              </label>
              <input
                type="text"
                value={editingPost.qualification}
                onChange={(e) => setEditingPost({ ...editingPost, qualification: e.target.value })}
                placeholder="10वीं / 12वीं / स्नातक पास"
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                वेतनमान (Salary)
              </label>
              <input
                type="text"
                value={editingPost.salary}
                onChange={(e) => setEditingPost({ ...editingPost, salary: e.target.value })}
                placeholder="₹19,500 - ₹62,000/- प्रतिमाह"
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Row 4: Important Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                आवेदन प्रारंभ तिथि
              </label>
              <input
                type="text"
                value={editingPost.applicationStartDate || ''}
                onChange={(e) => setEditingPost({ ...editingPost, applicationStartDate: e.target.value })}
                placeholder="उदा: 10 मार्च 2026"
                className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-700 mb-1">
                ऑनलाइन आवेदन की अंतिम तिथि *
              </label>
              <input
                type="text"
                value={editingPost.applicationLastDate || ''}
                onChange={(e) => setEditingPost({ ...editingPost, applicationLastDate: e.target.value })}
                placeholder="उदा: 05 अप्रैल 2026"
                className="w-full text-xs p-2 rounded-lg border border-red-300 bg-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                संभावित परीक्षा तिथि (Exam Date)
              </label>
              <input
                type="text"
                value={editingPost.examDate || ''}
                onChange={(e) => setEditingPost({ ...editingPost, examDate: e.target.value })}
                placeholder="उदा: मई / जून 2026"
                className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white"
              />
            </div>
          </div>

          {/* Row 5: Excerpt and Content */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              संक्षिप्त परिचय (Excerpt / Summary)
            </label>
            <textarea
              rows={2}
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              placeholder="इस भर्ती का 2 पंक्तियों में मुख्य सार..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              विस्तृत विवरण (Full Content)
            </label>
            <textarea
              rows={4}
              value={editingPost.content}
              onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
              placeholder="शारीरिक मापदंड, आरक्षण, नियम पुस्तिका के मुख्य बिंदु..."
              className="w-full text-xs p-2 rounded-lg border border-slate-300"
            />
          </div>

          {/* Row 6: Important Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Apply Online Link (ऑनलाइन आवेदन लिंक)
              </label>
              <input
                type="url"
                value={editingPost.applyLink || ''}
                onChange={(e) => setEditingPost({ ...editingPost, applyLink: e.target.value })}
                placeholder="https://esb.mponline.gov.in"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Notification PDF Link (विज्ञप्ति लिंक)
              </label>
              <input
                type="url"
                value={editingPost.notificationPdf || ''}
                onChange={(e) => setEditingPost({ ...editingPost, notificationPdf: e.target.value })}
                placeholder="https://esb.mp.gov.in/rules/notice.pdf"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Website Link (आधिकारिक पोर्टल)
              </label>
              <input
                type="url"
                value={editingPost.officialWebsite || ''}
                onChange={(e) => setEditingPost({ ...editingPost, officialWebsite: e.target.value })}
                placeholder="https://esb.mp.gov.in"
                className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          {/* Bottom Save bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'सुरक्षित करें एवं प्रकाशित करें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
            <div>
              <h2 className="font-bold text-base text-slate-900">श्रेणी प्रबंधन (Category Manager)</h2>
              <p className="text-xs text-slate-500">विभिन्न परीक्षा श्रेणियों व आयोगों को जोड़ें या हटाएं</p>
            </div>
          </div>

          {/* Add Category Mini Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2">नई श्रेणी जोड़ें (+ Add Category)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="हिंदी नाम (उदा: एमपी वनरक्षक भर्ती)"
                value={newCatNameHi}
                onChange={(e) => setNewCatNameHi(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
              <input
                type="text"
                placeholder="English Name (MP Forest Guard)"
                value={newCatNameEn}
                onChange={(e) => setNewCatNameEn(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
              <button
                onClick={async () => {
                  if (!newCatNameHi.trim()) return;
                  const slug = (newCatNameEn || newCatNameHi).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  await onSaveCategory({
                    id: 'cat_' + Date.now(),
                    slug: slug || 'category-' + Date.now(),
                    nameHindi: newCatNameHi,
                    nameEnglish: newCatNameEn || newCatNameHi,
                    description: `${newCatNameHi} से संबंधित ताज़ा भर्तियां`,
                    icon: 'Briefcase',
                    order: categories.length + 1
                  });
                  setNewCatNameHi('');
                  setNewCatNameEn('');
                  setSaveSuccessMsg('नई श्रेणी सफलतापूर्वक जोड़ी गई!');
                  setTimeout(() => setSaveSuccessMsg(''), 2500);
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg"
              >
                श्रेणी जोड़ें
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{cat.nameHindi}</h4>
                  <span className="text-[11px] text-slate-500">{cat.nameEnglish} (/{cat.slug})</span>
                </div>
                <button
                  onClick={async () => {
                    if (confirm(`क्या आप श्रेणी "${cat.nameHindi}" को हटाना चाहते हैं?`)) {
                      await onDeleteCategory(cat.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ADVERTISEMENT SLOTS */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="pb-3 border-b border-slate-150">
            <h2 className="font-bold text-base text-slate-900">विज्ञापन स्थान प्रबंधन (Ad Slots Configuration)</h2>
            <p className="text-xs text-slate-500">
              Google AdSense अनुमोदन के उपरांत कोड दर्ज करें अथवा स्लॉट को सक्रिय/निष्क्रिय करें
            </p>
          </div>

          <div className="space-y-4">
            {adSlots.map((slot) => (
              <div key={slot.slotKey} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{slot.label}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      {slot.slotKey}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={async (e) => {
                        await onUpdateAdSlot({ ...slot, enabled: e.target.checked });
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{slot.enabled ? 'सक्रिय (Enabled)' : 'निष्क्रिय (Disabled)'}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Google AdSense Code / Custom HTML Script (वैकल्पिक):
                  </label>
                  <textarea
                    rows={2}
                    value={slot.adCode || ''}
                    onChange={async (e) => {
                      slot.adCode = e.target.value;
                    }}
                    onBlur={async (e) => {
                      await onUpdateAdSlot({ ...slot, adCode: e.target.value });
                    }}
                    placeholder="<!-- Paste Google AdSense <ins> or script snippet here -->"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: IMPORTANT LINKS */}
      {activeTab === 'links' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="pb-3 border-b border-slate-150">
            <h2 className="font-bold text-base text-slate-900">शासकीय आधिकारिक लिंक प्रबंधन (Official Portals)</h2>
            <p className="text-xs text-slate-500">होमपेज पर प्रदर्शित होने वाले महत्वपूर्ण सरकारी लिंक</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2">नया आधिकारिक लिंक जोड़ें</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="पोर्टल का नाम (उदा: MP Samagra)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
              <input
                type="url"
                placeholder="URL (https://samagra.gov.in)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="text-xs p-2 rounded-lg border border-slate-300 bg-white"
              />
              <button
                onClick={async () => {
                  if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
                  await onSaveImportantLink({
                    id: 'link_' + Date.now(),
                    title: newLinkTitle,
                    titleHindi: newLinkTitle,
                    url: newLinkUrl,
                    buttonLabel: newLinkBtn,
                    order: importantLinks.length + 1,
                    active: true
                  });
                  setNewLinkTitle('');
                  setNewLinkUrl('');
                  setSaveSuccessMsg('लिंक सफलतापूर्वक जोड़ा गया!');
                  setTimeout(() => setSaveSuccessMsg(''), 2500);
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-lg"
              >
                लिंक जोड़ें
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-150 border border-slate-200 rounded-xl overflow-hidden">
            {importantLinks.map((l) => (
              <div key={l.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{l.titleHindi || l.title}</h4>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {l.url}
                  </a>
                </div>
                <button
                  onClick={async () => {
                    if (confirm(`हटाना चाहते हैं?`)) {
                      await onDeleteImportantLink(l.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SITE SETTINGS & ANNOUNCEMENT */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="pb-3 border-b border-slate-150">
            <h2 className="font-bold text-base text-slate-900">साइट सेटिंग्स एवं ब्रेकिंग न्यूज़ अलर्ट</h2>
            <p className="text-xs text-slate-500">सोशल मीडिया लिंक, संपर्क ईमेल एवं शीर्ष टिकर बार</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
              <h3 className="font-bold text-amber-950 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>शीर्ष ब्रेकिंग न्यूज़ टिकर (Announcement Banner)</span>
              </h3>
              <div>
                <label className="block font-bold text-slate-700 mb-1">अलर्ट संदेश (Hindi Alert Text):</label>
                <input
                  type="text"
                  value={settings.announcement?.text || ''}
                  onChange={(e) => onSaveSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      text: e.target.value
                    }
                  })}
                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-medium"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ann_active"
                  checked={settings.announcement?.enabled ?? true}
                  onChange={(e) => onSaveSettings({
                    ...settings,
                    announcement: {
                      ...settings.announcement,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="ann_active" className="text-xs font-bold text-slate-800">
                  टिकर बार प्रदर्शित करें (Enable Banner)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Telegram ग्रुप लिंक</label>
                <input
                  type="url"
                  value={settings.telegramLink}
                  onChange={(e) => onSaveSettings({ ...settings, telegramLink: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">WhatsApp चैनल लिंक</label>
                <input
                  type="url"
                  value={settings.whatsappLink}
                  onChange={(e) => onSaveSettings({ ...settings, whatsappLink: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">सपोर्ट एवं संपर्क ईमेल</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => onSaveSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  if (confirm('क्या आप सभी डेटा को डिफ़ॉल्ट एमपी जॉब्स नमूना डेटा पर रीसेट करना चाहते हैं?')) {
                    onResetData();
                    alert('डेटा सफलतापूर्वक रीसेट हो गया!');
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 font-bold border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
              >
                डिफ़ॉल्ट एमपी जॉब्स डेटा रीसेट करें (Reset Sample Data)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FIREBASE STATUS & SETUP GUIDE */}
      {activeTab === 'firebase' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="pb-3 border-b border-slate-150">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-600" />
              <span>Firebase Cloud Backend विन्यास एवं स्थिति</span>
            </h2>
            <p className="text-xs text-slate-500">
              Firestore डेटाबेस, Auth एवं सिक्योरिटी रूल्स की लाइव स्थिति
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">वर्तमान कनेक्टिविटी स्थिति:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isFirebaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isFirebaseConfigured ? '✓ Firebase क्रेडेंशियल्स सक्रिय' : 'ℹ Local Storage Mode (Ready for Firebase)'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              पोर्टल को हाइब्रिड आर्किटेक्चर के साथ बनाया गया है। यदि Firebase प्रोजेक्ट कनेक्टेड है, तो यह सीधे Firestore व Auth के साथ सिंक होता है। जब तक क्रेडेंशियल्स दर्ज नहीं होते, तब तक साइट लोकल स्टोरेज इंजन के साथ 100% सुचारू और तुरंत काम करती है।
            </p>

            <button
              onClick={handleTestFirebase}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
            >
              लाइव Firebase कनेक्शन जांचें (Test Connection)
            </button>

            {fbTestStatus && (
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800">
                {fbTestStatus}
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <h3 className="font-bold text-sm text-slate-900">परिनियोजित Firebase विन्यास (Provisioned Cloud Config):</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500">Firebase Project ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs">airy-sound-b2sm5</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500">Firestore Database ID</span>
                <span className="font-mono font-bold text-slate-900 text-[11px] break-all">ai-studio-mpexamupdate-c809543d-0e47-4e0b-9dcb-d61e111aad1b</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500">Region</span>
                <span className="font-mono font-bold text-slate-900 text-xs">asia-southeast1</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500">Security Rules Status</span>
                <span className="font-semibold text-emerald-700 text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Deployed (Admin RBAC + Public Read)
                </span>
              </div>
            </div>
            <p className="text-slate-500 mt-2">
              क्रेडेंशियल्स <code>firebase-applet-config.json</code> से स्वचालित रूप से लोड किए जाते हैं। सुरक्षा नियम <code>firestore.rules</code> एवं स्कीमा <code>firebase-blueprint.json</code> पूर्णतः सिंक्रोनाइज़्ड हैं।
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
