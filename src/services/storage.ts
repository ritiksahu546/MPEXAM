import { Post, Category, AdSlotConfig, ImportantLink, SiteSettings, UserProfile } from '../types';
import { 
  INITIAL_POSTS, 
  INITIAL_CATEGORIES, 
  INITIAL_AD_SLOTS, 
  INITIAL_IMPORTANT_LINKS, 
  INITIAL_SITE_SETTINGS 
} from '../data/initialData';
import { 
  db, 
  auth, 
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
  increment
} from 'firebase/firestore';

const STORAGE_KEYS = {
  POSTS: 'mp_exam_posts_v1',
  CATEGORIES: 'mp_exam_categories_v1',
  ADS: 'mp_exam_ads_v1',
  LINKS: 'mp_exam_links_v1',
  SETTINGS: 'mp_exam_settings_v1',
  DEMO_USER: 'mp_exam_demo_admin_v1'
};

// Initialize LocalStorage with rich sample data if not present
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADS)) {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_AD_SLOTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LINKS)) {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(INITIAL_IMPORTANT_LINKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
  }
}

initializeLocalStorage();

// Posts API
export async function getPosts(): Promise<Post[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'posts'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Post));
      }
    } catch (error) {
      console.warn('Firestore fetch failed, reading from local storage cache:', error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
  return stored ? JSON.parse(stored) : INITIAL_POSTS;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  const post = posts.find(p => p.slug === slug || p.id === slug);
  return post || null;
}

export async function savePost(post: Post): Promise<Post> {
  const posts = await getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  const now = new Date().toISOString();
  const updatedPost: Post = {
    ...post,
    updatedAt: now,
    createdAt: post.createdAt || now
  };

  if (index >= 0) {
    posts[index] = updatedPost;
  } else {
    posts.unshift(updatedPost);
  }

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'posts', post.id), updatedPost);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `posts/${post.id}`);
    }
  }

  return updatedPost;
}

export async function deletePost(postId: string): Promise<void> {
  const posts = await getPosts();
  const filtered = posts.filter(p => p.id !== postId);
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  }
}

export async function incrementPostViews(postId: string): Promise<void> {
  const posts = await getPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.viewCount = (post.viewCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        viewCount: increment(1)
      });
    } catch {
      // Non-blocking view increment
    }
  }
}

// Categories API
export async function getCategories(): Promise<Category[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
      }
    } catch (error) {
      console.warn('Categories Firestore read error, using cache:', error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
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

// Ads API
export async function getAdSlots(): Promise<AdSlotConfig[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'ads'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as AdSlotConfig));
      }
    } catch (error) {
      console.warn('Ad slots read fallback to local storage:', error);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.ADS);
  return stored ? JSON.parse(stored) : INITIAL_AD_SLOTS;
}

export async function updateAdSlot(slot: AdSlotConfig): Promise<void> {
  const ads = await getAdSlots();
  const idx = ads.findIndex(a => a.slotKey === slot.slotKey);
  if (idx >= 0) {
    ads[idx] = slot;
  } else {
    ads.push(slot);
  }
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'ads', slot.slotKey), slot);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `ads/${slot.slotKey}`);
    }
  }
}

// Important Links API
export async function getImportantLinks(): Promise<ImportantLink[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'links'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as ImportantLink));
      }
    } catch (error) {
      console.warn('Links read fallback to local storage:', error);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
  return stored ? JSON.parse(stored) : INITIAL_IMPORTANT_LINKS;
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

// Settings API
export async function getSettings(): Promise<SiteSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'general'));
      if (snap.exists()) {
        return snap.data() as SiteSettings;
      }
    } catch (error) {
      console.warn('Settings read fallback to local:', error);
    }
  }
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : INITIAL_SITE_SETTINGS;
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
    }
  }
  return settings;
}

// Demo Admin Authentication Simulation
export function getDemoAdminUser(): UserProfile | null {
  const stored = localStorage.getItem(STORAGE_KEYS.DEMO_USER);
  return stored ? JSON.parse(stored) : null;
}

export function setDemoAdminUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.DEMO_USER);
  }
}

// Reset sample data utility
export function resetToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_AD_SLOTS));
  localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(INITIAL_IMPORTANT_LINKS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SITE_SETTINGS));
}
