export type PostType = 'job' | 'admit_card' | 'result' | 'answer_key' | 'syllabus' | 'scheme';
export type PostStatus = 'published' | 'draft' | 'archived';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  title: string;
  titleHindi: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  categoryName: string;
  postType: PostType;
  organization: string;
  vacancy: string;
  qualification: string;
  salary: string;
  ageLimit: string;
  applicationStartDate: string;
  applicationLastDate: string;
  examDate: string;
  applicationFee: string;
  selectionProcess: string;
  examPattern: string;
  syllabus: string;
  documentsRequired: string;
  howToApply: string;
  officialWebsite: string;
  applyLink: string;
  notificationPdf: string;
  admitCardLink?: string;
  resultLink?: string;
  answerKeyLink?: string;
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  status: PostStatus;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  faqs?: FAQItem[];
}

export interface Category {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
  description: string;
  order: number;
  icon: string;
  count?: number;
}

export interface AdSlotConfig {
  id: string;
  slotKey: 'header_ad' | 'top_content_ad' | 'article_before' | 'article_middle' | 'article_after' | 'sidebar_ad' | 'between_posts' | 'footer_ad' | 'mobile_sticky_ad';
  label: string;
  enabled: boolean;
  adCode?: string;
  format: 'banner' | 'rectangle' | 'responsive' | 'sticky';
  minHeight: number;
}

export interface ImportantLink {
  id: string;
  title: string;
  titleHindi: string;
  url: string;
  buttonLabel: string;
  category: string;
  active: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  description: string;
  contactEmail: string;
  telegramLink: string;
  whatsappLink: string;
  youtubeLink: string;
  googleAnalyticsId: string;
  adSensePublisherId: string;
  searchConsoleCode: string;
  announcement: {
    text: string;
    link: string;
    enabled: boolean;
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
}
