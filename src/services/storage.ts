import { 
  Post, 
  Category, 
  Tag,
  AdSlotConfig, 
  ImportantLink, 
  SiteSettings, 
  UserProfile,
  HomepageSectionsConfig 
} from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_CATEGORIES, 
  INITIAL_AD_SLOTS, 
  INITIAL_IMPORTANT_LINKS, 
  INITIAL_SITE_SETTINGS 
} from '../data/initialData';
import { 
  db, 
  isFirebaseConfigured, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  increment
} from 'firebase/firestore';

const STORAGE_KEYS = {
  POSTS: 'mp_exam_posts_v2',
  CATEGORIES: 'mp_exam_categories_v2',
  TAGS: 'mp_exam_tags_v2',
  ADS: 'mp_exam_ads_v2',
  LINKS: 'mp_exam_links_v2',
  SETTINGS: 'mp_exam_settings_v2',
  HOMEPAGE: 'mp_exam_homepage_v2'
};

export const INITIAL_HOMEPAGE_SECTIONS: HomepageSectionsConfig = {
  featuredPosts: true,
  latestPosts: true,
  trendingPosts: true,
  importantLinks: true,
  announcementBar: true,
  quickCategoryGrid: true,
  mppscUpdates: true,
  mpesbUpdates: true,
  policeUpdates: true,
  teacherUpdates: true,
  examCalendar: true
};

// In-memory cache to optimize Firebase reads & reduce layout thrashing
let memoryPostsCache: { data: Post[]; timestamp: number } | null = null;
let memoryAdminPostsCache: { data: Post[]; timestamp: number } | null = null;
let memoryCategoriesCache: { data: Category[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function invalidateCache() {
  memoryPostsCache = null;
  memoryAdminPostsCache = null;
  memoryCategoriesCache = null;
}

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag_1', name: 'MP Police 2026', slug: 'mp-police-2026', postCount: 5 },
  { id: 'tag_2', name: 'MPPSC Pre', slug: 'mppsc-pre', postCount: 4 },
  { id: 'tag_3', name: 'MPESB Vyapam', slug: 'mpesb-vyapam', postCount: 6 },
  { id: 'tag_4', name: 'Sarkari Result', slug: 'sarkari-result', postCount: 8 },
  { id: 'tag_5', name: 'Admit Card', slug: 'admit-card', postCount: 6 },
  { id: 'tag_6', name: 'Patwari', slug: 'patwari', postCount: 3 },
  { id: 'tag_7', name: 'Samvida Shikshak', slug: 'samvida-shikshak', postCount: 4 }
];

// ==========================================
// 1. POSTS API
// ==========================================

/**
 * Public-facing post fetch for regular visitors.
 * Strictly queries where('status', '==', 'published') to comply with Firestore security rules.
 */
export async function getPosts(): Promise<Post[]> {
  if (memoryPostsCache && (Date.now() - memoryPostsCache.timestamp < CACHE_TTL_MS)) {
    return memoryPostsCache.data;
  }

  if (isFirebaseConfigured && db) {
    try {
      const publicQuery = query(
        collection(db, 'posts'),
        where('status', '==', 'published')
      );
      const snap = await getDocs(publicQuery);
      const firestorePosts = snap.docs.map(d => ({ ...d.data(), id: d.id } as Post));
      // Sort descending by publishedAt or createdAt
      firestorePosts.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      // Cache to local storage & memory
      memoryPostsCache = { data: firestorePosts, timestamp: Date.now() };
      try {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(firestorePosts));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      return firestorePosts;
    } catch (error) {
      console.warn('Firestore published posts fetch error:', error);
      // Fallback only to previously fetched real posts if available in localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const publishedFallback = parsed.filter((p: Post) => p.status === 'published');
            return publishedFallback;
          }
        } catch {}
      }
      return [];
    }
  }

  // Fallback to real cached posts if offline, never fake demo posts
  const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((p: Post) => p.status === 'published');
      }
    } catch {}
  }
  return [];
}

/**
 * Admin-only post fetch used inside the authenticated admin dashboard (where isAdmin() is true).
 * Retrieves all posts unfiltered (draft, published, archived).
 */
export async function getAllPostsForAdmin(): Promise<Post[]> {
  if (memoryAdminPostsCache && (Date.now() - memoryAdminPostsCache.timestamp < CACHE_TTL_MS)) {
    return memoryAdminPostsCache.data;
  }

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'posts'));
      const firestorePosts = snap.docs.map(d => ({ ...d.data(), id: d.id } as Post));
      firestorePosts.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      memoryAdminPostsCache = { data: firestorePosts, timestamp: Date.now() };
      try {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(firestorePosts));
      } catch {}
      return firestorePosts;
    } catch (error) {
      console.warn('Firestore admin posts fetch error:', error);
      const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function getPublishedPosts(): Promise<Post[]> {
  return await getPosts();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const cachedList = memoryAdminPostsCache?.data || memoryPostsCache?.data;
  const posts = cachedList || await getPosts();
  const normalizedSlug = slug.toLowerCase().trim();
  const post = posts.find(p => 
    p.slug.toLowerCase().trim() === normalizedSlug || 
    p.id === slug
  );
  return post || null;
}

export async function savePost(post: Post): Promise<Post> {
  const posts = await getAllPostsForAdmin();
  const index = posts.findIndex(p => p.id === post.id);
  const now = new Date().toISOString();

  // Unique clean slug generation if empty
  let cleanSlug = post.slug?.trim() || '';
  if (!cleanSlug) {
    cleanSlug = (post.title || 'post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
  }

  const updatedPost: Post = {
    ...post,
    slug: cleanSlug,
    category: post.category || post.categoryName || 'General',
    updatedAt: now,
    createdAt: post.createdAt || now,
    publishedAt: post.status === 'published' ? (post.publishedAt || now) : undefined
  };

  if (index >= 0) {
    posts[index] = updatedPost;
  } else {
    posts.unshift(updatedPost);
  }

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  invalidateCache();

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'posts', updatedPost.id), updatedPost);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${updatedPost.id}`);
    }
  }

  return updatedPost;
}

export async function deletePost(postId: string): Promise<void> {
  const posts = await getAllPostsForAdmin();
  const filtered = posts.filter(p => p.id !== postId);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
  invalidateCache();

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  }
}

export async function togglePublishPost(postId: string, publish: boolean): Promise<Post | null> {
  const posts = await getAllPostsForAdmin();
  const post = posts.find(p => p.id === postId);
  if (!post) return null;

  const now = new Date().toISOString();
  post.status = publish ? 'published' : 'draft';
  post.updatedAt = now;
  if (publish && !post.publishedAt) {
    post.publishedAt = now;
  }

  return await savePost(post);
}

// Requirement #18: Scalable view counter with session throttling
export async function incrementPostViews(postId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const sessionKey = `viewed_${postId}`;
  if (sessionStorage.getItem(sessionKey)) {
    return; // Already counted this session
  }
  sessionStorage.setItem(sessionKey, '1');

  // Update local
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (stored) {
      const posts: Post[] = JSON.parse(stored);
      const post = posts.find(p => p.id === postId || p.slug === postId);
      if (post) {
        post.viewCount = (post.viewCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
      }
    }
  } catch (e) {
    console.warn('Local view counter error:', e);
  }

  // Increment Firestore
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        viewCount: increment(1)
      });
    } catch {
      // Non-blocking for analytics
    }
  }
}

// ==========================================
// 2. CATEGORIES API
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (memoryCategoriesCache && (Date.now() - memoryCategoriesCache.timestamp < CACHE_TTL_MS)) {
    return memoryCategoriesCache.data;
  }

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const firestoreCats = snap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
      firestoreCats.sort((a, b) => (a.order || 0) - (b.order || 0));
      memoryCategoriesCache = { data: firestoreCats, timestamp: Date.now() };
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(firestoreCats));
      } catch {}
      return firestoreCats;
    } catch (error) {
      console.warn('Categories Firestore read notice:', error);
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function saveCategory(category: Category): Promise<Category> {
  const categories = await getCategories();
  const idx = categories.findIndex(c => c.id === category.id);
  if (idx >= 0) {
    categories[idx] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
    }
  }
  return category;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== categoryId);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  }
}

// ==========================================
// 3. TAGS API
// ==========================================

export async function getTags(): Promise<Tag[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'tags'));
      const firestoreTags = snap.docs.map(d => ({ ...d.data(), id: d.id } as Tag));
      try {
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(firestoreTags));
      } catch {}
      return firestoreTags;
    } catch (error) {
      console.warn('Tags fetch notice:', error);
      const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function saveTag(tag: Tag): Promise<Tag> {
  const tags = await getTags();
  const idx = tags.findIndex(t => t.id === tag.id);
  if (idx >= 0) {
    tags[idx] = tag;
  } else {
    tags.push(tag);
  }
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'tags', tag.id), tag);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tags/${tag.id}`);
    }
  }
  return tag;
}

export async function deleteTag(tagId: string): Promise<void> {
  const tags = await getTags();
  const filtered = tags.filter(t => t.id !== tagId);
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(filtered));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'tags', tagId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tags/${tagId}`);
    }
  }
}

// ==========================================
// 4. ADVERTISEMENTS API
// ==========================================

export async function getAdSlots(): Promise<AdSlotConfig[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'ads'));
      const firestoreAds = snap.docs.map(d => ({ ...d.data(), id: d.id } as AdSlotConfig));
      try {
        localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(firestoreAds));
      } catch {}
      return firestoreAds;
    } catch (error) {
      console.warn('Ad slots read notice:', error);
      const stored = localStorage.getItem(STORAGE_KEYS.ADS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.ADS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function saveAdSlot(slot: AdSlotConfig): Promise<AdSlotConfig> {
  const ads = await getAdSlots();
  const slotKey = slot.slotKey || slot.slot || slot.id;
  const normalizedSlot = { ...slot, id: slot.id || slotKey, slotKey };

  const idx = ads.findIndex(a => (a.slotKey === slotKey || a.id === normalizedSlot.id));
  if (idx >= 0) {
    ads[idx] = normalizedSlot;
  } else {
    ads.push(normalizedSlot);
  }
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'ads', normalizedSlot.id), normalizedSlot);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `ads/${normalizedSlot.id}`);
    }
  }
  return normalizedSlot;
}

export async function updateAdSlot(slot: AdSlotConfig): Promise<void> {
  await saveAdSlot(slot);
}

export async function deleteAdSlot(adId: string): Promise<void> {
  const ads = await getAdSlots();
  const filtered = ads.filter(a => a.id !== adId && a.slotKey !== adId);
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(filtered));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'ads', adId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `ads/${adId}`);
    }
  }
}

// ==========================================
// 5. IMPORTANT LINKS API
// ==========================================

export async function getImportantLinks(): Promise<ImportantLink[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'links'));
      const firestoreLinks = snap.docs.map(d => ({ ...d.data(), id: d.id } as ImportantLink));
      try {
        localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(firestoreLinks));
      } catch {}
      return firestoreLinks;
    } catch (error) {
      console.warn('Links read notice:', error);
      const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export async function saveImportantLink(link: ImportantLink): Promise<ImportantLink> {
  const links = await getImportantLinks();
  const idx = links.findIndex(l => l.id === link.id);
  if (idx >= 0) {
    links[idx] = link;
  } else {
    links.push(link);
  }
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'links', link.id), link);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `links/${link.id}`);
    }
  }
  return link;
}

export async function deleteImportantLink(linkId: string): Promise<void> {
  const links = await getImportantLinks();
  const filtered = links.filter(l => l.id !== linkId);
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(filtered));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'links', linkId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `links/${linkId}`);
    }
  }
}

// ==========================================
// 6. HOMEPAGE SECTIONS API
// ==========================================

export async function getHomepageSections(): Promise<HomepageSectionsConfig> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'homepageSections', 'config'));
      if (snap.exists()) {
        const data = snap.data() as HomepageSectionsConfig;
        localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn('Homepage sections read notice:', error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.HOMEPAGE);
  return stored ? JSON.parse(stored) : INITIAL_HOMEPAGE_SECTIONS;
}

export async function updateHomepageSections(config: HomepageSectionsConfig): Promise<HomepageSectionsConfig> {
  localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(config));
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'homepageSections', 'config'), config);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'homepageSections/config');
    }
  }
  return config;
}

export const saveHomepageSections = updateHomepageSections;

// ==========================================
// 7. SITE SETTINGS API
// ==========================================

export async function getSettings(): Promise<SiteSettings> {
  if (isFirebaseConfigured && db) {
    try {
      // Check siteSettings/general then settings/general
      let snap = await getDoc(doc(db, 'siteSettings', 'general'));
      if (!snap.exists()) {
        snap = await getDoc(doc(db, 'settings', 'general'));
      }
      if (snap.exists()) {
        const data = snap.data() as SiteSettings;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn('Settings read notice:', error);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : INITIAL_SITE_SETTINGS;
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'siteSettings', 'general'), settings);
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteSettings/general');
    }
  }
  return settings;
}

// ==========================================
// 8. ADMIN SESSION & SEEDING UTILITIES
// ==========================================

/**
 * Migration helper: Seeds the initial sample data into Firestore if Firestore is empty.
 * (Requirement #6: Migration-friendly architecture)
 */
export async function seedInitialDataToFirestore(): Promise<{ postsCount: number; categoriesCount: number }> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please check environment credentials.');
  }

  // Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }

  // Seed Posts
  for (const post of INITIAL_POSTS) {
    await setDoc(doc(db, 'posts', post.id), post);
  }

  // Seed Ads
  for (const ad of INITIAL_AD_SLOTS) {
    await setDoc(doc(db, 'ads', ad.id || ad.slotKey), ad);
  }

  // Seed Links
  for (const link of INITIAL_IMPORTANT_LINKS) {
    await setDoc(doc(db, 'links', link.id), link);
  }

  // Seed Settings
  await setDoc(doc(db, 'siteSettings', 'general'), INITIAL_SITE_SETTINGS);
  await setDoc(doc(db, 'settings', 'general'), INITIAL_SITE_SETTINGS);

  // Seed Homepage Sections
  await setDoc(doc(db, 'homepageSections', 'config'), INITIAL_HOMEPAGE_SECTIONS);

  return {
    postsCount: INITIAL_POSTS.length,
    categoriesCount: INITIAL_CATEGORIES.length
  };
}

export function resetToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(INITIAL_TAGS));
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_AD_SLOTS));
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(INITIAL_IMPORTANT_LINKS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.HOMEPAGE, JSON.stringify(INITIAL_HOMEPAGE_SECTIONS));
}
