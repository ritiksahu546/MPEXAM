export type PostType = 'job' | 'admit_card' | 'result' | 'answer_key' | 'syllabus' | 'scheme' | 'previous_paper';
export type PostStatus = 'published' | 'draft' | 'archived';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Post {
  id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string;
  categoryId: string;
  categoryName?: string;
  tags?: string[];
  featuredImage?: string;
  notificationPdf?: string;
  notificationLink?: string;
  organization: string;
  postType: PostType;

  // Important Dates
  applicationStartDate: string;
  applicationLastDate: string;
  examDate: string;

  // Job Information
  vacancy: string;
  qualification: string;
  ageLimit: string;
  ageRelaxation?: string;
  applicationFee: string;
  salary: string;
  selectionProcess: string;
  examPattern: string;
  syllabus: string;
  documentsRequired: string;
  howToApply: string;

  // Links
  applyLink: string;
  officialWebsite: string;
  admitCardLink?: string;
  resultLink?: string;
  answerKeyLink?: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string;
  canonicalUrl?: string;

  // Status & Meta
  status: PostStatus;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  faqs?: FAQItem[];
}

export interface Category {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  slug: string;
  description: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  icon: string;
  count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export type AdSlotType = 
  | 'HEADER'
  | 'TOP_CONTENT'
  | 'ARTICLE_BEFORE'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_AFTER'
  | 'SIDEBAR'
  | 'BETWEEN_POSTS'
  | 'FOOTER'
  | 'MOBILE_STICKY'
  // Support legacy keys as well
  | 'header_ad'
  | 'top_content_ad'
  | 'article_before'
  | 'article_middle'
  | 'article_after'
  | 'sidebar_ad'
  | 'between_posts'
  | 'footer_ad'
  | 'mobile_sticky_ad';

export type AdSlotLocation = AdSlotType;

export interface AdSlotConfig {
  id: string;
  slot?: AdSlotType;
  slotKey?: string;
  name?: string;
  label?: string;
  enabled: boolean;
  isActive?: boolean;
  provider?: 'adsense' | 'custom' | string;
  code?: string;
  adCode?: string;
  format?: 'banner' | 'rectangle' | 'responsive' | 'sticky' | '300x250' | '728x90' | string;
  minHeight?: number;
  startDate?: string;
  endDate?: string;
}

export interface ImportantLink {
  id: string;
  title: string;
  titleHindi?: string;
  url: string;
  buttonLabel?: string;
  category?: string;
  active: boolean;
}

export interface HomepageSectionsConfig {
  featuredPosts: boolean;
  latestPosts: boolean;
  trendingPosts: boolean;
  importantLinks: boolean;
  announcementBar: boolean;
  quickCategoryGrid: boolean;
  mppscUpdates?: boolean;
  mpesbUpdates?: boolean;
  policeUpdates?: boolean;
  teacherUpdates?: boolean;
  examCalendar?: boolean;
  schemes?: boolean;
  previousPapers?: boolean;
  syllabus?: boolean;
  seoContent?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteTagline?: string;
  logo?: string;
  logoUrl?: string;
  favicon?: string;
  faviconUrl?: string;
  description: string;
  siteDescription?: string;
  contactEmail: string;
  contactPhone?: string;
  whatsappLink: string;
  telegramLink: string;
  youtubeLink: string;
  facebookLink?: string;
  socialLinks?: {
    whatsapp?: string;
    telegram?: string;
    youtube?: string;
    facebook?: string;
  };
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
  googleAnalyticsId: string;
  adSensePublisherId: string;
  googleAdsenseClientId?: string;
  searchConsoleCode: string;
  googleSearchConsoleVerification?: string;
  tickerText?: string;
  tickerLink?: string;
  tickerEnabled?: boolean;
  announcement: {
    text: string;
    link: string;
    enabled: boolean;
  };
  homepageSections?: HomepageSectionsConfig;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'editor' | 'user';
  isAdmin: boolean;
}
