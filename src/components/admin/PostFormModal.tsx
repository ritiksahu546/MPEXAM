import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  DollarSign, 
  Sparkles,
  Search,
  Check
} from 'lucide-react';
import { Post, Category, Tag } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { uploadImageToStorage, uploadPdfToStorage } from '../../services/firebase';
import { getCategories } from '../../services/storage';
import { JobDetailView } from '../views/JobDetailView';

interface Props {
  post: Post | null;
  categories: Category[];
  availableTags?: Tag[];
  onClose: () => void;
  onSave: (post: Post) => Promise<void>;
  onNavigate?: (route: string) => void;
}

export const PostFormModal: React.FC<Props> = ({
  post,
  categories,
  availableTags = [],
  onClose,
  onSave,
  onNavigate
}) => {
  const isEditing = Boolean(post?.id && !post.id.startsWith('temp_'));

  const [formData, setFormData] = useState<Post>(() => {
    if (post) return { ...post };
    const id = 'post_' + Date.now();
    return {
      id,
      title: '',
      titleHindi: '',
      slug: '',
      categoryId: categories[0]?.id || 'mppsc',
      categoryName: categories[0]?.nameHindi || 'MPPSC',
      category: categories[0]?.nameEnglish || 'MPPSC',
      postType: 'job',
      organization: 'मध्य प्रदेश शासन',
      vacancy: '',
      qualification: '',
      ageLimit: '18 से 40 वर्ष (आरक्षित वर्गों को नियमानुसार आयु सीमा में छूट)',
      ageRelaxation: 'मध्य प्रदेश के मूल निवासी SC/ST/OBC/दिव्यांग अभ्यर्थियों को अधिकतम आयु में 5 वर्ष की छूट नियमानुसार देय होगी।',
      applicationFee: 'सामान्य / अन्य राज्य अभ्यर्थी: ₹500 | MP SC/ST/OBC/EWS: ₹250 | पोर्टल शुल्क अतिरिक्त',
      salary: '',
      applicationStartDate: new Date().toLocaleDateString('hi-IN'),
      applicationLastDate: '',
      examDate: '',
      selectionProcess: '1. ऑनलाइन लिखित परीक्षा (CBT)\n2. दस्तावेज़ सत्यापन (Document Verification)\n3. चिकित्सीय परीक्षण (Medical Examination)',
      examPattern: '100 वस्तुनिष्ठ बहुविकल्पीय प्रश्न (MCQs) • कुल अंक: 100 • समयावधि: 2 घंटे • कोई नकारात्मक अंकन नहीं',
      syllabus: 'सामान्य ज्ञान, समसामयिक घटनाएं, मध्य प्रदेश सामान्य परिचय, तार्किक अभियोग्यता एवं गणित।',
      documentsRequired: '10वीं / 12वीं की अंकसूची, निवास प्रमाण पत्र, जाति प्रमाण पत्र, आधार कार्ड, नवीनतम पासपोर्ट आकार का फोटो एवं हस्ताक्षर।',
      howToApply: '1. एमपी ऑनलाइन (MP Online Kiosk / Portal) की आधिकारिक वेबसाइट पर जाएं।\n2. नवीन प्रोफाइल पंजीकरण अथवा लॉगिन करें।\n3. संबंधित पद हेतु आवेदन पत्र सावधानीपूर्वक भरें।\n4. निर्धारित दस्तावेज एवं फोटो-हस्ताक्षर अपलोड करें।\n5. नेट बैंकिंग / डेबिट कार्ड / UPI द्वारा आवेदन शुल्क जमा करें एवं रसीद प्रिंट करें।',
      content: '',
      excerpt: '',
      featuredImage: '',
      applyLink: 'https://www.mponline.gov.in',
      notificationLink: '',
      notificationPdf: '',
      officialWebsite: 'https://mp.gov.in',
      faqs: [
        { question: 'आवेदन की अंतिम तिथि क्या है?', answer: 'आवेदन करने की अंतिम तिथि ऊपर दी गई महत्वपूर्ण तिथियों की तालिका में उपलब्ध है।' },
        { question: 'क्या अन्य राज्यों के अभ्यर्थी भी आवेदन कर सकते हैं?', answer: 'हाँ, अन्य राज्यों के अभ्यर्थी सामान्य (अनारक्षित) श्रेणी के अंतर्गत आवेदन कर सकते हैं।' }
      ],
      seoTitle: '',
      seoDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      tags: [],
      status: 'published',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 15
    };
  });

  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'dates_fees' | 'job_details' | 'content' | 'links_media' | 'seo' | 'faqs'>('basic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Manage loaded categories and loading state
  const [activeCategories, setActiveCategories] = useState<Category[]>(categories || []);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(!categories || categories.length === 0);

  // Sync with prop changes or load dynamically if empty
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategories(categories);
      setIsLoadingCategories(false);
    } else {
      let isMounted = true;
      setIsLoadingCategories(true);
      getCategories()
        .then(cats => {
          if (isMounted) {
            setActiveCategories(cats);
            setIsLoadingCategories(false);
          }
        })
        .catch(err => {
          console.error('Failed to load categories in modal:', err);
          if (isMounted) {
            setIsLoadingCategories(false);
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, [categories]);

  // Ensure new post selects an existing category once loaded
  useEffect(() => {
    if (!isEditing && activeCategories.length > 0) {
      const match = activeCategories.find(c => c.id === formData.categoryId);
      if (!match) {
        const first = activeCategories[0];
        setFormData(prev => ({
          ...prev,
          categoryId: first.id,
          categoryName: first.nameHindi,
          category: first.nameEnglish
        }));
      }
    }
  }, [activeCategories, isEditing, formData.categoryId]);

  // Auto generate slug if empty
  const handleTitleChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, title: val };
      if (!isEditing && (!prev.slug || prev.slug.startsWith('post-'))) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 80);
      }
      return updated;
    });
  };

  const handleCategoryChange = (catId: string) => {
    const selected = activeCategories.find(c => c.id === catId);
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      categoryName: selected?.nameHindi || catId,
      category: selected?.nameEnglish || catId
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('कृपया केवल इमेज फाइल (JPG, PNG, WebP) अपलोड करें।');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('इमेज फाइल का आकार 5MB से कम होना चाहिए।');
      return;
    }

    setUploadError('');
    setIsUploadingImage(true);
    try {
      const url = await uploadImageToStorage(file, 'posts');
      setFormData(prev => ({ ...prev, featuredImage: url }));
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'इमेज अपलोड विफल रहा।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('कृपया केवल वैध PDF फाइल अपलोड करें।');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('PDF का आकार 25MB से कम होना चाहिए।');
      return;
    }

    setUploadError('');
    setIsUploadingPdf(true);
    try {
      const url = await uploadPdfToStorage(file, 'notifications');
      setFormData(prev => ({ 
        ...prev, 
        notificationPdf: url,
        notificationLink: prev.notificationLink || url 
      }));
    } catch (err: any) {
      console.error('PDF upload failed:', err);
      setUploadError(err.message || 'PDF अपलोड विफल रहा।');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleAddTag = () => {
    const t = newTagInput.trim();
    if (!t) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...currentTags, t] }));
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = async (targetStatus?: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      alert('कृपया पोस्ट का मुख्य शीर्षक (Title) दर्ज करें!');
      setActiveSubTab('basic');
      return;
    }

    setIsSubmitting(true);
    try {
      const toSave: Post = {
        ...formData,
        status: targetStatus || formData.status,
        updatedAt: new Date().toISOString()
      };
      if (toSave.status === 'published') {
        toSave.publishedAt = toSave.publishedAt || new Date().toISOString();
      } else if (!toSave.publishedAt) {
        delete (toSave as any).publishedAt;
      }
      await onSave(toSave);
      onClose();
    } catch (err: any) {
      alert('सेव करने में त्रुटि: ' + (err.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-snug">
                {isEditing ? 'विज्ञप्ति संपादित करें (Edit Post)' : 'नई विज्ञप्ति जोड़ें (Create New Post)'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {formData.status === 'published' ? '🟢 स्थिति: प्रकाशित (Published)' : '🟡 स्थिति: ड्राफ्ट (Draft)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">लाइव प्रीव्यू</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-medium overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('basic')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'basic' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. मूल विवरण (Basic)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('dates_fees')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'dates_fees' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. तिथियां व शुल्क (Dates & Fees)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('job_details')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'job_details' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. पद एवं चयन (Job Criteria)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('content')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'content' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            4. विस्तृत लेख (Rich Content)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('links_media')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'links_media' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            5. मीडिया व लिंक्स (Media & Links)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('seo')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'seo' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            6. SEO सेटिंग्स
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('faqs')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'faqs' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            7. अक्सर पूछे जाने वाले प्रश्न (FAQs)
          </button>
        </div>

        {uploadError && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Modal Form Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          
          {/* TAB 1: BASIC INFO */}
          {activeSubTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मुख्य शीर्षक (English Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="MP Police Constable Recruitment 2026 Apply Online"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    हिंदी शीर्षक (Hindi Title)
                  </label>
                  <input
                    type="text"
                    value={formData.titleHindi || ''}
                    onChange={e => setFormData({ ...formData, titleHindi: e.target.value })}
                    placeholder="मध्य प्रदेश पुलिस कांस्टेबल भर्ती 2026 आवेदन शुरू"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    URL Slug (स्थायी लिंक) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="mp-police-constable-recruitment-2026"
                    className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    श्रेणी (Category) <span className="text-red-500">*</span>
                  </label>
                  {isLoadingCategories ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-xs">
                      <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                      <span>श्रेणियां लोड हो रही हैं...</span>
                    </div>
                  ) : activeCategories.length === 0 ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-amber-300 rounded-xl bg-amber-50 text-amber-800 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>कोई श्रेणी उपलब्ध नहीं है</span>
                    </div>
                  ) : (
                    <select
                      value={formData.categoryId}
                      onChange={e => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white text-sm"
                      required
                    >
                      {activeCategories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nameHindi} ({c.nameEnglish})
                        </option>
                      ))}
                      {/* Preserve existing post category if not in activeCategories list */}
                      {formData.categoryId && !activeCategories.some(c => c.id === formData.categoryId) && (
                        <option value={formData.categoryId}>
                          {formData.categoryName || formData.category || formData.categoryId}
                        </option>
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    प्रकार (Post Type)
                  </label>
                  <select
                    value={formData.postType}
                    onChange={e => setFormData({ ...formData, postType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="job">नई भर्ती (Latest Job)</option>
                    <option value="result">परीक्षा परिणाम (Result)</option>
                    <option value="admit_card">प्रवेश पत्र (Admit Card)</option>
                    <option value="answer_key">उत्तर कुंजी (Answer Key)</option>
                    <option value="syllabus">पाठ्यक्रम (Syllabus)</option>
                    <option value="admission">प्रवेश (Admission)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    विभाग / आयोग (Organization)
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={e => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="MPESB / MP Police / MPPSC"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  संक्षिप्त विवरण (Short Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="पाठकों को होमपेज एवं सूची में दिखने वाला 2 पंक्तियों का संक्षिप्त सारांश..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>होमपेज पर खास (Featured Post) बनाएं</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">प्रकाशन स्थिति:</span>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="published">प्रकाशित (Published - सबको दिखेगा)</option>
                    <option value="draft">ड्राफ्ट (Draft - केवल एडमिन को)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATES & FEES */}
          {activeSubTab === 'dates_fees' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    आवेदन प्रारंभ तिथि (Start Date)
                  </label>
                  <input
                    type="text"
                    value={formData.applicationStartDate}
                    onChange={e => setFormData({ ...formData, applicationStartDate: e.target.value })}
                    placeholder="15/03/2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    आवेदन की अंतिम तिथि (Last Date) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicationLastDate}
                    onChange={e => setFormData({ ...formData, applicationLastDate: e.target.value })}
                    placeholder="15/04/2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    परीक्षा तिथि (Exam Date)
                  </label>
                  <input
                    type="text"
                    value={formData.examDate || ''}
                    onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                    placeholder="जून 2026 (संभावित)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  आवेदन शुल्क विवरण (Application Fee)
                </label>
                <textarea
                  rows={3}
                  value={formData.applicationFee}
                  onChange={e => setFormData({ ...formData, applicationFee: e.target.value })}
                  placeholder="सामान्य / अनारक्षित: ₹500 | MP आरक्षित वर्ग: ₹250..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: JOB CRITERIA */}
          {activeSubTab === 'job_details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    कुल पद संख्या (Total Vacancies)
                  </label>
                  <input
                    type="text"
                    value={formData.vacancy}
                    onChange={e => setFormData({ ...formData, vacancy: e.target.value })}
                    placeholder="7,500 पद (आरक्षक जीडी व विशेष बल)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    वेतनमान (Salary / Pay Scale)
                  </label>
                  <input
                    type="text"
                    value={formData.salary || ''}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="₹19,500 - ₹62,000/- (लेवल-4)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  शैक्षणिक योग्यता (Educational Qualification)
                </label>
                <textarea
                  rows={2}
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="10वीं अथवा 12वीं कक्षा उत्तीर्ण (मान्यता प्राप्त मंडल से)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    आयु सीमा (Age Limit)
                  </label>
                  <input
                    type="text"
                    value={formData.ageLimit}
                    onChange={e => setFormData({ ...formData, ageLimit: e.target.value })}
                    placeholder="18 से 36 वर्ष"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    आयु छूट (Age Relaxation)
                  </label>
                  <input
                    type="text"
                    value={formData.ageRelaxation || ''}
                    onChange={e => setFormData({ ...formData, ageRelaxation: e.target.value })}
                    placeholder="MP के आरक्षित वर्गों को नियमानुसार 5 वर्ष की छूट"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  चयन प्रक्रिया (Selection Process)
                </label>
                <textarea
                  rows={2}
                  value={formData.selectionProcess}
                  onChange={e => setFormData({ ...formData, selectionProcess: e.target.value })}
                  placeholder="1. लिखित परीक्षा (CBT)\n2. शारीरिक दक्षता परीक्षण (PET)\n3. दस्तावेज़ सत्यापन"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  परीक्षा पैटर्न (Exam Pattern & Marking Scheme)
                </label>
                <textarea
                  rows={2}
                  value={formData.examPattern || ''}
                  onChange={e => setFormData({ ...formData, examPattern: e.target.value })}
                  placeholder="कुल 100 बहुविकल्पीय प्रश्न (MCQs) • 100 अंक • समयावधि 2 घंटे..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  विस्तृत पाठ्यक्रम (Syllabus Summary)
                </label>
                <textarea
                  rows={2}
                  value={formData.syllabus || ''}
                  onChange={e => setFormData({ ...formData, syllabus: e.target.value })}
                  placeholder="सामान्य ज्ञान, सामान्य अभिरुचि, बौद्धिक क्षमता, गणित, विज्ञान..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  आवश्यक दस्तावेज (Required Documents)
                </label>
                <textarea
                  rows={2}
                  value={formData.documentsRequired || ''}
                  onChange={e => setFormData({ ...formData, documentsRequired: e.target.value })}
                  placeholder="10वीं/12वीं अंकसूची, MP मूल निवासी प्रमाण पत्र, जाति प्रमाण पत्र, आधार कार्ड..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  आवेदन कैसे करें (How to Apply)
                </label>
                <textarea
                  rows={2}
                  value={formData.howToApply}
                  onChange={e => setFormData({ ...formData, howToApply: e.target.value })}
                  placeholder="चरणबद्ध ऑनलाइन आवेदन प्रक्रिया..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: RICH CONTENT */}
          {activeSubTab === 'content' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-800">
                  विस्तृत लेख सामग्री (Sanitized Rich Article Body)
                </label>
                <span className="text-[11px] text-slate-500">
                  हेडिंग्स, पैराग्राफ, तालिकाओं और लिंक्स के साथ सुरक्षित HTML
                </span>
              </div>
              <RichTextEditor
                value={formData.content || ''}
                onChange={cleanHtml => setFormData({ ...formData, content: cleanHtml })}
                placeholder="इस भर्ती अथवा परीक्षा की विस्तृत अधिसूचना, पदवार ब्यौरा एवं नियम यहां लिखें..."
              />
            </div>
          )}

          {/* TAB 5: MEDIA & LINKS */}
          {activeSubTab === 'links_media' && (
            <div className="space-y-5">
              {/* Featured Image Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>मुख्य थंबनेल इमेज (Featured Image)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Firebase Storage से इमेज अपलोड करें:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {isUploadingImage && (
                      <p className="text-xs text-blue-600 mt-1 animate-pulse">
                        Firebase Storage पर अपलोड हो रहा है...
                      </p>
                    )}
                    <div className="mt-2">
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">
                        अथवा इमेज URL पेस्ट करें:
                      </label>
                      <input
                        type="url"
                        value={formData.featuredImage || ''}
                        onChange={e => setFormData({ ...formData, featuredImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {formData.featuredImage && (
                    <div className="border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center">
                      <img
                        src={formData.featuredImage}
                        alt="Preview"
                        className="h-28 object-cover rounded-lg border border-slate-100 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-slate-500 mt-1">थंबनेल प्रीव्यू</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Official PDF Notification Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>आधिकारिक नोटिफिकेशन PDF (Official PDF Notification)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Firebase Storage में PDF अपलोड करें:
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      disabled={isUploadingPdf}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    {isUploadingPdf && (
                      <p className="text-xs text-emerald-600 mt-1 animate-pulse">
                        PDF Firebase Storage पर सुरक्षित अपलोड हो रहा है...
                      </p>
                    )}
                    <div className="mt-2">
                      <label className="block font-semibold text-slate-700 mb-1 text-xs">
                        अथवा डायरेक्ट PDF लिंक दर्ज करें:
                      </label>
                      <input
                        type="url"
                        value={formData.notificationPdf || ''}
                        onChange={e => setFormData({ ...formData, notificationPdf: e.target.value, notificationLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {formData.notificationPdf && (
                    <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-bold">PDF सफलतापूर्वक संलग्न है</p>
                        <a
                          href={formData.notificationPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 underline truncate block max-w-xs mt-0.5"
                        >
                          पीडीएफ देखें (Open PDF)
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    ऑनलाइन आवेदन लिंक (Apply Online URL)
                  </label>
                  <input
                    type="url"
                    value={formData.applyLink}
                    onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                    placeholder="https://esb.mponline.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    आधिकारिक वेबसाइट (Official Website)
                  </label>
                  <input
                    type="url"
                    value={formData.officialWebsite}
                    onChange={e => setFormData({ ...formData, officialWebsite: e.target.value })}
                    placeholder="https://esb.mp.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    प्रवेश पत्र डाउनलोड लिंक (Admit Card URL)
                  </label>
                  <input
                    type="url"
                    value={formData.admitCardLink || ''}
                    onChange={e => setFormData({ ...formData, admitCardLink: e.target.value })}
                    placeholder="https://esb.mp.gov.in/admit_card"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    परीक्षा परिणाम लिंक (Result URL)
                  </label>
                  <input
                    type="url"
                    value={formData.resultLink || ''}
                    onChange={e => setFormData({ ...formData, resultLink: e.target.value })}
                    placeholder="https://esb.mp.gov.in/results"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    उत्तर कुंजी लिंक (Answer Key URL)
                  </label>
                  <input
                    type="url"
                    value={formData.answerKeyLink || ''}
                    onChange={e => setFormData({ ...formData, answerKeyLink: e.target.value })}
                    placeholder="https://esb.mp.gov.in/model_answer_keys"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block font-bold text-slate-800 mb-1">
                  टैग्स (Tags for Filter & Search)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formData.tags || []).map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="टैग नाम लिखें (e.g. MP Police 2026, Constable)"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900"
                  >
                    टैग जोड़ें
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEO SETTINGS */}
          {activeSubTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  कस्टम SEO टाइटल (Meta Title)
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder={formData.title || 'MP Exam Update 2026'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  Google खोज में दिखने वाला शीर्षक (अनुशंसित 50-60 वर्ण)
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मेटा विवरण (Meta Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={e => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder={formData.excerpt || 'मध्य प्रदेश सरकारी भर्ती 2026 का विस्तृत विवरण, आवेदन लिंक एवं अंतिम तिथि...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500">
                  अनुशंसित लंबाई: 140-160 वर्ण
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    फोकस कीवर्ड (Focus Keyword)
                  </label>
                  <input
                    type="text"
                    value={formData.focusKeyword || ''}
                    onChange={e => setFormData({ ...formData, focusKeyword: e.target.value })}
                    placeholder="MP Police Constable 2026"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    गौण कीवर्ड्स (Secondary Keywords)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryKeywords || ''}
                    onChange={e => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                    placeholder="MPESB Bharti 2026, Vyapam Admit Card, MP Police Result"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    कैनोनिकल URL (Canonical URL)
                  </label>
                  <input
                    type="url"
                    value={formData.canonicalUrl || ''}
                    onChange={e => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder={`https://www.mpexamupdates.in/job/${formData.slug || ''}`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FAQ BUILDER */}
          {activeSubTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">
                    अक्सर पूछे जाने वाले प्रश्न (FAQ Builder for Rich Snippets)
                  </h4>
                  <p className="text-[11px] text-blue-700">
                    Google खोज परिणामों में FAQ रिच परिणाम प्रदर्शित करने हेतु प्रश्न और उत्तर जोड़ें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    faqs: [...(formData.faqs || []), { question: '', answer: '' }]
                  })}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shrink-0 shadow-2xs"
                >
                  + नया प्रश्न जोड़ें
                </button>
              </div>

              {/* Quick Template Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-medium">त्वरित प्रश्न टेम्पलेट:</span>
                {[
                  'आवेदन करने की अंतिम तिथि क्या है?',
                  'शैक्षणिक योग्यता एवं पात्रता क्या है?',
                  'कुल कितने रिक्त पदों पर भर्ती होगी?',
                  'चयन प्रक्रिया में क्या-क्या चरण होंगे?',
                  'क्या अन्य राज्यों के अभ्यर्थी आवेदन कर सकते हैं?'
                ].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        faqs: [...(formData.faqs || []), { question: q, answer: '' }]
                      });
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 rounded border border-slate-200 transition-colors"
                  >
                    + {q}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {(!formData.faqs || formData.faqs.length === 0) ? (
                  <div className="text-center py-8 border border-dashed border-slate-300 rounded-xl text-slate-500">
                    कोई FAQ नहीं जोड़ा गया। ऊपर दिए गए बटन से नया प्रश्न जोड़ें।
                  </div>
                ) : (
                  formData.faqs.map((faq, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-xl bg-slate-50 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">प्रश्न #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.faqs || []).filter((_, i) => i !== index);
                            setFormData({ ...formData, faqs: updated });
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          हटाएं ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={e => {
                          const updated = [...(formData.faqs || [])];
                          updated[index] = { ...updated[index], question: e.target.value };
                          setFormData({ ...formData, faqs: updated });
                        }}
                        placeholder="प्रश्न लिखें (e.g. परीक्षा कब आयोजित होगी?)"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={e => {
                          const updated = [...(formData.faqs || [])];
                          updated[index] = { ...updated[index], answer: e.target.value };
                          setFormData({ ...formData, faqs: updated });
                        }}
                        placeholder="उत्तर लिखें..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            रद्द करें (Cancel)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('draft')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all disabled:opacity-50"
            >
              ड्राफ्ट सहेजें (Save Draft)
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('published')}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'अपडेट एवं प्रकाशित करें' : 'प्रकाशित करें (Publish)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Exact Live Preview Modal (Requirement #29: Identical to public page) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 p-2 sm:p-6 backdrop-blur-xs flex flex-col items-center justify-center">
          <div className="bg-slate-100 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-4 py-3 bg-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs sm:text-sm">
                  लाइव आर्टिकल प्रीव्यू (Public Page Simulation)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-2.5 py-1 bg-blue-800 hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors"
              >
                प्रीव्यू बंद करें ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <JobDetailView
                post={formData}
                relatedPosts={[]}
                categories={activeCategories}
                adSlots={[]}
                onNavigate={() => {}}
                onSelectPost={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
