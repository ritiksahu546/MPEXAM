import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, terminate } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';
import { INITIAL_POSTS, INITIAL_CATEGORIES } from '../data/initialData';
import { Post, Category } from '../types';
import { generateSitemapXml, DEFAULT_BASE_URL } from '../utils/sitemapGenerator';

/**
 * Fetches all currently published posts and categories directly from Firestore
 * and returns the live XML sitemap string.
 */
export async function getLiveSitemapXml(baseUrl: string = DEFAULT_BASE_URL): Promise<string> {
  let db: ReturnType<typeof getFirestore> | null = null;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: appletConfig.apiKey,
      projectId: appletConfig.projectId,
      appId: appletConfig.appId
    });
    db = getFirestore(app, appletConfig.firestoreDatabaseId);

    // Query strictly where status == 'published' to comply with Firestore security rules
    const postQuery = query(collection(db, 'posts'), where('status', '==', 'published'));
    const postSnap = await getDocs(postQuery);
    const firestorePosts = postSnap.docs.map(d => ({ ...d.data(), id: d.id } as Post));

    // Sort descending by publication date
    firestorePosts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Query categories
    const catSnap = await getDocs(collection(db, 'categories'));
    const firestoreCats = catSnap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
    firestoreCats.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Terminate DB connection to avoid hanging Node sockets/listeners
    await terminate(db);

    const finalPosts = firestorePosts.length > 0 
      ? firestorePosts 
      : INITIAL_POSTS.filter(p => p.status === 'published');

    const finalCats = firestoreCats.length > 0 
      ? firestoreCats 
      : INITIAL_CATEGORIES;

    return generateSitemapXml(finalPosts, finalCats, baseUrl);
  } catch (err) {
    console.warn('Notice: Firestore sitemap live query encountered an issue, generating fallback sitemap:', err);
    if (db) {
      try {
        await terminate(db);
      } catch {}
    }
    return generateSitemapXml(
      INITIAL_POSTS.filter(p => p.status === 'published'),
      INITIAL_CATEGORIES,
      baseUrl
    );
  }
}
