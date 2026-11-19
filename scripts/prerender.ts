import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, terminate } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';
import { INITIAL_POSTS, INITIAL_CATEGORIES } from '../src/data/initialData';
import { Post, Category } from '../src/types';
import {
  DEFAULT_BASE_URL,
  normalizeCategorySlug,
  normalizePostSlug,
  normalizeCanonicalUrl,
  doesPostMatchCategory,
  formatDateToYMD
} from '../src/utils/sitemapGenerator';
import { generateAndWriteSitemap } from './build-sitemap';

const BASE_URL = DEFAULT_BASE_URL; // https://mpexamupdates.in

interface RouteMetadata {
  route: string;
  title: string;
  description: string;
  canonicalUrl: string;
  noindex?: boolean;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object;
  prerenderHtml: string;
}

/**
 * Strips HTML tags for safe plain-text summary/meta description insertion.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

/**
 * Escapes HTML text content to prevent broken tags from dynamic data.
 */
function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes HTML attributes for safe meta injection.
 */
function escapeAttr(str?: string | null): string {
  return escapeHtml(str);
}

/**
 * Safely converts arbitrary date strings to ISO strings without throwing RangeError.
 */
function safeIsoDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const ymd = formatDateToYMD(dateStr);
  if (ymd) {
    return `${ymd}T00:00:00.000Z`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return undefined;
  }
  return d.toISOString();
}

/**
 * Checks whether a job application deadline has already passed.
 */
function isJobExpired(lastDateStr?: string): boolean {
  const ymd = formatDateToYMD(lastDateStr);
  if (!ymd) return false;
  const expiry = new Date(`${ymd}T23:59:59.999Z`).getTime();
  if (isNaN(expiry)) return false;
  return expiry < Date.now();
}

async function fetchPublishedData(): Promise<{ posts: Post[]; categories: Category[] }> {
  let db: ReturnType<typeof getFirestore> | null = null;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: appletConfig.apiKey,
      projectId: appletConfig.projectId,
      appId: appletConfig.appId
    });
    db = getFirestore(app, appletConfig.firestoreDatabaseId);

    const postQuery = query(collection(db, 'posts'), where('status', '==', 'published'));
    const postSnap = await getDocs(postQuery);
    const firestorePosts = postSnap.docs.map(d => ({ ...d.data(), id: d.id } as Post));

    firestorePosts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const catSnap = await getDocs(collection(db, 'categories'));
    const firestoreCats = catSnap.docs.map(d => ({ ...d.data(), id: d.id } as Category));
    firestoreCats.sort((a, b) => (a.order || 0) - (b.order || 0));

    await terminate(db);

    const posts = firestorePosts.length > 0
      ? firestorePosts
      : INITIAL_POSTS.filter(p => p.status === 'published');

    const categories = firestoreCats.length > 0
      ? firestoreCats
      : INITIAL_CATEGORIES;

    return { posts, categories };
  } catch (err) {
    console.error('[Prerender] Firestore fetch failed:', err);
    if (db) {
      try {
        await terminate(db);
      } catch {}
    }
    throw new Error(`[Prerender] Firestore query failed during prerendering: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function buildSharedShell(
  innerMainHtml: string,
  canonicalCategories: Category[]
): string {
  const topCatLinks = canonicalCategories
    .slice(0, 10)
    .map(c => `<a href="/category/${escapeAttr(c.slug)}" class="text-xs text-blue-700 hover:underline font-semibold">${escapeHtml(c.nameHindi || c.nameEnglish)}</a>`)
    .join(' • ');

  return `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header class="bg-blue-900 text-white py-4 px-4 sm:px-6 shadow-xs">
        <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <a href="/" class="text-xl font-black tracking-tight text-white">MP Exam Update</a>
          <nav aria-label="Main Navigation" class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold">
            <a href="/" class="hover:underline text-white">होम</a>
            <a href="/jobs" class="hover:underline text-white">सरकारी नौकरी (Jobs)</a>
            <a href="/admit-cards" class="hover:underline text-white">एडमिट कार्ड (Admit Cards)</a>
            <a href="/results" class="hover:underline text-white">रिजल्ट (Results)</a>
            <a href="/answer-keys" class="hover:underline text-white">उत्तर कुंजी (Answer Keys)</a>
            <a href="/categories" class="hover:underline text-amber-300">सभी श्रेणियां (Categories)</a>
          </nav>
        </div>
      </header>
      <main class="max-w-6xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        ${innerMainHtml}
        <section aria-label="Explore Categories" class="bg-white p-5 rounded-2xl border border-slate-200 mt-8">
          <h2 class="text-base font-bold text-slate-900 mb-2">प्रमुख भर्ती श्रेणियां (MP Exam Categories)</h2>
          <p class="leading-relaxed">${topCatLinks}</p>
        </section>
      </main>
      <footer class="bg-slate-900 text-slate-300 py-8 px-4 mt-12 text-xs">
        <div class="max-w-6xl mx-auto space-y-4">
          <div class="flex flex-wrap items-center gap-4 font-medium">
            <a href="/" class="hover:text-white">होमपेज</a>
            <a href="/jobs" class="hover:text-white">नवीनतम नौकरियां</a>
            <a href="/admit-cards" class="hover:text-white">प्रवेश पत्र</a>
            <a href="/results" class="hover:text-white">परीक्षा परिणाम</a>
            <a href="/answer-keys" class="hover:text-white">उत्तर कुंजी</a>
            <a href="/categories" class="hover:text-white">समस्त श्रेणियां</a>
            <a href="/about" class="hover:text-white">हमारे बारे में (About Us)</a>
            <a href="/contact" class="hover:text-white">संपर्क करें (Contact Us)</a>
            <a href="/privacy-policy" class="hover:text-white">गोपनीयता नीति (Privacy Policy)</a>
            <a href="/terms-and-conditions" class="hover:text-white">नियम एवं शर्तें (Terms &amp; Conditions)</a>
            <a href="/disclaimer" class="hover:text-white">अस्वीकरण (Disclaimer)</a>
            <a href="/advertisement" class="hover:text-white">विज्ञापन नीति (Advertisement)</a>
            <a href="/sitemap" class="hover:text-white">साइटमैप (HTML Sitemap)</a>
          </div>
          <p class="text-slate-400">
            वैधानिक अस्वीकरण: mpexamupdates.in किसी भी सरकारी विभाग या आयोग की आधिकारिक वेबसाइट नहीं है। यह मध्य प्रदेश के अभ्यर्थियों के लिए एक स्वतंत्र शैक्षणिक व रोजगार सूचना पोर्टल है।
          </p>
        </div>
      </footer>
    </div>
  `;
}

function renderPostsListHtml(postsList: Post[], emptyText: string): string {
  if (postsList.length === 0) {
    return `<p class="text-slate-600 text-sm">${escapeHtml(emptyText)}</p>`;
  }
  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${postsList.map(p => {
        const cleanSlug = normalizePostSlug(p.slug);
        const expired = isJobExpired(p.applicationLastDate);
        return `
          <article class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div class="flex items-center justify-between gap-2 text-xs text-slate-500">
              <span class="font-semibold text-blue-700">${escapeHtml(p.organization || 'मध्य प्रदेश शासन')}</span>
              <span class="${expired ? 'text-slate-600' : 'text-emerald-700 font-bold'}">${expired ? 'आवेदन बंद (Closed)' : 'सक्रिय (Active)'}</span>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900">
              <a href="/job/${escapeAttr(cleanSlug)}" class="text-blue-800 hover:underline">${escapeHtml(p.titleHindi || p.title)}</a>
            </h2>
            ${p.titleHindi && p.title && p.title !== p.titleHindi ? `<p class="text-xs text-slate-500 font-medium">${escapeHtml(p.title)}</p>` : ''}
            ${p.excerpt ? `<p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(stripHtml(p.excerpt).slice(0, 180))}</p>` : ''}
            <div class="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
              ${p.vacancy ? `<span>कुल पद: <strong>${escapeHtml(p.vacancy)}</strong></span>` : ''}
              ${p.qualification ? `<span>योग्यता: <strong>${escapeHtml(p.qualification)}</strong></span>` : ''}
              ${p.applicationLastDate ? `<span>अंतिम तिथि: <strong class="text-red-600">${escapeHtml(p.applicationLastDate)}</strong></span>` : ''}
            </div>
            <div class="pt-1">
              <a href="/job/${escapeAttr(cleanSlug)}" class="text-xs font-bold text-blue-700 hover:underline">संपूर्ण भर्ती विवरण एवं आधिकारिक लिंक देखें →</a>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

export async function runPrerender(): Promise<void> {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.resolve(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.warn('[Prerender] dist/index.html not found. Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');
  const { posts, categories } = await fetchPublishedData();

  // Deduplicate categories by canonical slug
  const canonicalCategoriesMap = new Map<string, Category>();
  for (const cat of categories) {
    if (!cat || !cat.slug || (cat as Category & { active?: boolean }).active === false) continue;
    const cleanSlug = normalizeCategorySlug(cat.slug);
    if (!cleanSlug) continue;
    if (!canonicalCategoriesMap.has(cleanSlug)) {
      canonicalCategoriesMap.set(cleanSlug, { ...cat, slug: cleanSlug });
    }
  }
  const canonicalCategories = Array.from(canonicalCategoriesMap.values());

  console.log(`[Prerender] Starting static prerendering for ${posts.length} published posts and ${canonicalCategories.length} canonical categories...`);

  const jobPosts = posts.filter(p => p.postType === 'job' || !p.postType);
  const admitCardPosts = posts.filter(p => doesPostMatchCategory(p, null, 'admit-card'));
  const resultPosts = posts.filter(p => doesPostMatchCategory(p, null, 'results'));
  const answerKeyPosts = posts.filter(p => doesPostMatchCategory(p, null, 'answer-key'));

  const baseOrgAndWebSiteSchema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      'name': 'MP Exam Update',
      'url': `${BASE_URL}/`,
      'description': 'मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB व्यापम भर्ती एवं प्रवेश पत्र पोर्टल',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      'name': 'MP Exam Update',
      'url': `${BASE_URL}/`,
      'logo': {
        '@type': 'ImageObject',
        'url': `${BASE_URL}/favicon.svg`
      }
    }
  ];

  // Build route list
  const routes: RouteMetadata[] = [
    // 1. Homepage
    {
      route: '',
      title: 'MP Exam Update - मध्य प्रदेश सरकारी नौकरी एवं परीक्षा पोर्टल 2026',
      description: 'MP Exam Update: मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB (व्यापम), पुलिस भर्ती, शिक्षक भर्ती, एडमिट कार्ड, रिजल्ट और आंसर-की की नवीनतम अपडेट।',
      canonicalUrl: `${BASE_URL}/`,
      ogType: 'website',
      jsonLd: [
        ...baseOrgAndWebSiteSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'मध्य प्रदेश सरकारी नौकरी में आवेदन हेतु रोजगार पंजीयन अनिवार्य है क्या?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'हाँ, मध्य प्रदेश की अधिकांश भर्ती परीक्षाओं (विशेषकर MPESB एवं पुलिस भर्ती) में आवेदन करते समय अभ्यर्थी का मध्य प्रदेश रोजगार पोर्टल (mprojgar.gov.in) पर जीवित पंजीयन होना अनिवार्य होता है।'
              }
            },
            {
              '@type': 'Question',
              'name': 'क्या अन्य राज्यों के उम्मीदवार भी MP की सरकारी नौकरियों में आवेदन कर सकते हैं?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'हाँ, अन्य राज्यों के अभ्यर्थी भी सामान्य (अनारक्षित) श्रेणी के अंतर्गत आवेदन कर सकते हैं। आरक्षित श्रेणियों के आरक्षण एवं आयु छूट का लाभ केवल मध्य प्रदेश के मूल निवासियों को देय होता है।'
              }
            }
          ]
        }
      ],
      prerenderHtml: buildSharedShell(`
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">मध्य प्रदेश सरकारी नौकरी एवं परीक्षा पोर्टल 2026 (MP Exam Update)</h1>
          <p class="text-slate-600 text-sm leading-relaxed">
            MPPSC, MPESB (व्यापम), एमपी पुलिस, शिक्षक पात्रता परीक्षा (TET), पटवारी, केंद्र सरकार की भर्तियों, प्रवेश पत्र एवं परीक्षा परिणामों की सबसे तेज़ और प्रामाणिक जानकारी।
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            ${canonicalCategories.map(c => `<a href="/category/${escapeAttr(c.slug)}" class="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-bold border border-blue-200">${escapeHtml(c.nameHindi)}</a>`).join('')}
          </div>
        </section>
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-900">नवीनतम सरकारी नौकरियां एवं परीक्षा अपडेट्स (Latest MP Govt Jobs 2026)</h2>
            <a href="/jobs" class="text-sm font-bold text-blue-700 hover:underline">सभी भर्तियां देखें →</a>
          </div>
          ${renderPostsListHtml(posts, 'वर्तमान में कोई नई पोस्ट उपलब्ध नहीं है।')}
        </section>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <h2 class="text-lg font-bold text-slate-900">मध्य प्रदेश सरकारी नौकरी एवं भर्ती परीक्षाएं 2026: मार्गदर्शिका</h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            मध्य प्रदेश में शासकीय सेवा में चयन हेतु राज्य सरकार द्वारा मध्य प्रदेश लोक सेवा आयोग (MPPSC इंदौर) एवं म.प्र. कर्मचारी चयन मंडल (MPESB भोपाल) के माध्यम से वर्ष भर भर्ती परीक्षाएं आयोजित की जाती हैं। MP Exam Update (mpexamupdates.in) का उद्देश्य अभ्यर्थियों तक आधिकारिक विज्ञप्ति, पात्रता, सिलेबस, एडमिट कार्ड और रिजल्ट की सटीक जानकारी समय पर पहुँचाना है।
          </p>
        </section>
      `, canonicalCategories)
    },

    // 2. Jobs Listing
    {
      route: 'jobs',
      title: 'मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Govt Jobs 2026) | MP Exam Update',
      description: 'मध्य प्रदेश की नवीनतम सरकारी नौकरियां, एमपीपीएससी, व्यापम (MPESB), पुलिस कांस्टेबल, सब-इंस्पेक्टर, शिक्षक और केंद्रीय भर्ती 2026 की पात्रता व ऑनलाइन आवेदन लिंक।',
      canonicalUrl: `${BASE_URL}/jobs`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Govt Jobs 2026)',
        'description': 'मध्य प्रदेश एवं केंद्र सरकार के विभागों की नवीनतम सरकारी नौकरियां और ऑनलाइन आवेदन लिंक।',
        'url': `${BASE_URL}/jobs`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'सरकारी नौकरियां', 'item': `${BASE_URL}/jobs` }
          ]
        }
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>सरकारी नौकरियां (MP Latest Jobs)</span></nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Govt Jobs 2026)</h1>
          <p class="text-slate-600 text-sm">मध्य प्रदेश शासन, MPPSC, MPESB (व्यापम), पुलिस विभाग, ग्रामीण विकास एवं केंद्रीय विभागों में जारी सभी सक्रिय भर्ती अधिसूचनाओं की सूची।</p>
        </section>
        ${renderPostsListHtml(jobPosts.length > 0 ? jobPosts : posts, 'नई सरकारी नौकरियों की सूची जल्द अपडेट की जाएगी।')}
      `, canonicalCategories)
    },

    // 3. Admit Cards
    {
      route: 'admit-cards',
      title: 'मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026) डाउनलोड | MP Exam Update',
      description: 'MPPSC, MPESB (व्यापम), एमपी पुलिस, एसएससी और अन्य प्रतियोगी परीक्षाओं के एडमिट कार्ड / प्रवेश पत्र डाउनलोड लिंक और परीक्षा तिथि सूचना।',
      canonicalUrl: `${BASE_URL}/admit-cards`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026)',
        'description': 'MPPSC, MPESB (व्यापम), पुलिस और अन्य एमपी प्रतियोगी परीक्षाओं के एडमिट कार्ड डाउनलोड लिंक।',
        'url': `${BASE_URL}/admit-cards`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'प्रवेश पत्र (Admit Cards)', 'item': `${BASE_URL}/admit-cards` }
          ]
        }
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>प्रवेश पत्र (Admit Cards)</span></nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026) एवं परीक्षा तिथियां</h1>
          <p class="text-slate-600 text-sm">MPPSC राज्य सेवा, MPESB (व्यापम), पुलिस भर्ती, शिक्षक पात्रता एवं केंद्रीय परीक्षाओं के आधिकारिक एडमिट कार्ड (Hall Ticket) और परीक्षा शहर सूचना डाउनलोड करें।</p>
        </section>
        ${renderPostsListHtml(admitCardPosts.length > 0 ? admitCardPosts : posts, 'नवीनतम प्रवेश पत्र अपडेट्स नीचे सूचीबद्ध हैं।')}
      `, canonicalCategories)
    },

    // 4. Results
    {
      route: 'results',
      title: 'मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Results 2026) | MP Exam Update',
      description: 'मध्य प्रदेश सरकारी परीक्षा परिणाम, MPPSC व MPESB चयन सूची, मेरिट लिस्ट और कट-ऑफ अंक 2026 की आधिकारिक जानकारी।',
      canonicalUrl: `${BASE_URL}/results`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Results 2026)',
        'description': 'मध्य प्रदेश सरकारी परीक्षा परिणाम, चयन सूची, मेरिट लिस्ट और कट-ऑफ अंक 2026।',
        'url': `${BASE_URL}/results`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'परीक्षा परिणाम (Results)', 'item': `${BASE_URL}/results` }
          ]
        }
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>परीक्षा परिणाम (Results)</span></nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Exam Results 2026)</h1>
          <p class="text-slate-600 text-sm">MPPSC, MPESB (व्यापम), पुलिस, पटवारी एवं शिक्षक भर्ती परीक्षाओं के आधिकारिक परिणाम, स्कोरकार्ड, कट-ऑफ अंक तथा अंतिम चयन सूची (Merit List) देखें।</p>
        </section>
        ${renderPostsListHtml(resultPosts.length > 0 ? resultPosts : posts, 'नवीनतम परीक्षा परिणाम एवं भर्ती अपडेट्स नीचे देखें।')}
      `, canonicalCategories)
    },

    // 5. Answer Keys
    {
      route: 'answer-keys',
      title: 'मध्य प्रदेश परीक्षा उत्तर कुंजी (MP Exam Answer Key 2026) | MP Exam Update',
      description: 'मध्य प्रदेश प्रतियोगी परीक्षाओं (MPPSC, MPESB व्यापम, पुलिस, शिक्षक भर्ती) की आधिकारिक उत्तर कुंजी, मॉडल उत्तर और आपत्ति दर्ज करने के सीधे लिंक।',
      canonicalUrl: `${BASE_URL}/answer-keys`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'मध्य प्रदेश परीक्षा उत्तर कुंजी (MP Exam Answer Key 2026)',
        'description': 'मध्य प्रदेश प्रतियोगी परीक्षाओं की आधिकारिक उत्तर कुंजी और आपत्ति लिंक।',
        'url': `${BASE_URL}/answer-keys`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'उत्तर कुंजी (Answer Keys)', 'item': `${BASE_URL}/answer-keys` }
          ]
        }
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>उत्तर कुंजी (Answer Keys)</span></nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">मध्य प्रदेश परीक्षा उत्तर कुंजी (MP Exam Answer Key 2026)</h1>
          <p class="text-slate-600 text-sm">MPPSC और MPESB (व्यापम) द्वारा आयोजित लिखित व ऑनलाइन परीक्षाओं की प्रोविजनल एवं फाइनल उत्तर कुंजी (Model Answer Key PDF) डाउनलोड करें।</p>
        </section>
        ${renderPostsListHtml(answerKeyPosts.length > 0 ? answerKeyPosts : posts, 'सभी परीक्षाओं की उत्तर कुंजी एवं संबंधित भर्ती सूचनाएं।')}
      `, canonicalCategories)
    },

    // 6. Categories Hub
    {
      route: 'categories',
      title: 'समस्त भर्ती श्रेणियां (All MP Job Categories) - MPPSC, MPESB, Police | MP Exam Update',
      description: 'मध्य प्रदेश सरकारी भर्ती एवं परीक्षाओं की सभी प्रमुख श्रेणियां: MPPSC, MPESB व्यापम, पुलिस भर्ती, शिक्षक भर्ती, पटवारी, पंचायत और केंद्रीय नौकरियां।',
      canonicalUrl: `${BASE_URL}/categories`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'समस्त भर्ती श्रेणियां (All MP Job Categories)',
        'description': 'मध्य प्रदेश सरकारी भर्ती एवं परीक्षाओं की सभी प्रमुख श्रेणियां।',
        'url': `${BASE_URL}/categories`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'सभी श्रेणियां', 'item': `${BASE_URL}/categories` }
          ]
        }
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>समस्त श्रेणियां (All Categories)</span></nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">समस्त श्रेणियां एवं विभाग (All MP Recruitment Categories 2026)</h1>
          <p class="text-slate-600 text-sm">मध्य प्रदेश एवं केंद्र सरकार के विभिन्न आयोगों, भर्ती बोर्डों और परीक्षा वर्गों की श्रेणीवार सूची।</p>
        </section>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${canonicalCategories.map(cat => `
            <div class="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <h2 class="text-lg font-bold text-slate-900">
                <a href="/category/${escapeAttr(cat.slug)}" class="text-blue-800 hover:underline">${escapeHtml(cat.nameHindi)} (${escapeHtml(cat.nameEnglish)})</a>
              </h2>
              <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(cat.description || `${cat.nameHindi} से संबंधित सभी नवीनतम सरकारी नौकरियां, एडमिट कार्ड और परिणाम।`)}</p>
              <a href="/category/${escapeAttr(cat.slug)}" class="inline-block text-xs font-bold text-blue-700 hover:underline">${escapeHtml(cat.nameHindi)} अपडेट्स देखें →</a>
            </div>
          `).join('')}
        </div>
      `, canonicalCategories)
    },

    // 7. About Us
    {
      route: 'about',
      title: 'हमारे बारे में (About Us) | MP Exam Update',
      description: 'MP Exam Update (mpexamupdates.in) मध्य प्रदेश का समर्पित सरकारी नौकरी व परीक्षा पोर्टल है। हमारी टीम, उद्देश्य एवं प्रामाणिक सूचना मिशन की जानकारी।',
      canonicalUrl: `${BASE_URL}/about`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'name': 'हमारे बारे में (About Us) - MP Exam Update',
        'description': 'MP Exam Update (mpexamupdates.in) मध्य प्रदेश का समर्पित सरकारी नौकरी व परीक्षा पोर्टल है।',
        'url': `${BASE_URL}/about`
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>हमारे बारे में (About Us)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">हमारे बारे में (About Us) — MP Exam Update</h1>
          <p class="text-slate-700 text-sm leading-relaxed">
            <strong>MP Exam Update (mpexamupdates.in)</strong> मध्य प्रदेश का एक स्वतंत्र, विश्वसनीय और समर्पित शैक्षणिक एवं रोजगार सूचना पोर्टल है। हमारा मुख्य उद्देश्य राज्य के लाखों प्रतियोगी छात्रों तक सरकारी नौकरियों, परीक्षाओं, प्रवेश पत्रों, परीक्षा परिणामों, उत्तर कुंजियों तथा सरकारी योजनाओं की सटीक और ताज़ा जानकारी पहुँचाना है।
          </p>
          <h2 class="text-lg font-bold text-slate-900">हमारा उद्देश्य एवं दृष्टि (Our Mission)</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-slate-700">
            <li>मध्य प्रदेश के ग्रामीण व शहरी हर क्षेत्र के छात्रों तक रोजगार अधिसूचनाएं समय पर पहुँचाना।</li>
            <li>भ्रामक और फर्जी खबरों से छात्रों को बचाना तथा केवल सत्यापित व आधिकारिक स्रोतों से जानकारी देना।</li>
            <li>आसान और स्पष्ट हिंदी भाषा में जटिल सरकारी अधिसूचनाओं को सरल बनाकर समझाना।</li>
            <li><a href="/category/mppsc" class="text-blue-700 hover:underline">MPPSC</a>, <a href="/category/mpesb" class="text-blue-700 hover:underline">MPESB (व्यापम)</a>, <a href="/category/mp-police" class="text-blue-700 hover:underline">पुलिस भर्ती</a>, <a href="/category/teacher-jobs" class="text-blue-700 hover:underline">शिक्षक पात्रता</a> एवं <a href="/category/central-jobs" class="text-blue-700 hover:underline">केंद्रीय भर्तियों</a> की समयबद्ध जानकारी।</li>
          </ul>
        </article>
      `, canonicalCategories)
    },

    // 8. Contact Us
    {
      route: 'contact',
      title: 'संपर्क करें (Contact Us) | MP Exam Update',
      description: 'MP Exam Update सहायता टीम से संपर्क करें। भर्ती सूचना, विज्ञापन, सुझाव और तकनीकी सहायता के लिए ई-मेल व सोशल चैनल के माध्यम से जुड़ें।',
      canonicalUrl: `${BASE_URL}/contact`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': 'संपर्क करें (Contact Us) - MP Exam Update',
        'description': 'MP Exam Update सहायता टीम से संपर्क करें।',
        'url': `${BASE_URL}/contact`
      },
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>संपर्क करें (Contact Us)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">संपर्क करें (Contact Us) — MP Exam Update</h1>
          <p class="text-slate-700 text-sm leading-relaxed">
            यदि आपके पास MP Exam Update पोर्टल के संबंध में कोई सुझाव, प्रश्न, त्रुटि सुधार या विज्ञापन संबंधी पूछताछ है, तो आप नीचे दिए गए माध्यम से हमारी संपादकीय एवं सहायता टीम से संपर्क कर सकते हैं:
          </p>
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
            <p><strong>आधिकारिक ई-मेल (Email Support):</strong> <a href="mailto:contact@mpexamupdates.in" class="text-blue-700 hover:underline">contact@mpexamupdates.in</a></p>
            <p><strong>प्रत्युत्तर समय:</strong> सोमवार से शनिवार (24 से 48 कार्य घंटों के भीतर)</p>
          </div>
          <p class="text-xs text-slate-600">
            कृपया ध्यान दें: हम किसी भी सरकारी भर्ती के लिए आवेदन स्वीकार नहीं करते और न ही हम कोई सरकारी आयोग हैं। अपना एडमिट कार्ड डाउनलोड करने या फॉर्म भरने हेतु संबंधित आधिकारिक वेबसाइट का ही उपयोग करें।
          </p>
        </article>
      `, canonicalCategories)
    },

    // 9. Privacy Policy
    {
      route: 'privacy-policy',
      title: 'गोपनीयता नीति (Privacy Policy) | MP Exam Update',
      description: 'MP Exam Update पोर्टल की गोपनीयता नीति। जानें कि हम उपयोगकर्ता की निजता, कुकीज़, लॉग फाइल्स और डेटा सुरक्षा का किस प्रकार संरक्षण करते हैं।',
      canonicalUrl: `${BASE_URL}/privacy-policy`,
      ogType: 'website',
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>गोपनीयता नीति (Privacy Policy)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">गोपनीयता नीति (Privacy Policy)</h1>
          <p>MP Exam Update (mpexamupdates.in) पर हम अपने पाठकों की गोपनीयता का अत्यधिक सम्मान करते हैं। यह नीति स्पष्ट करती है कि जब आप हमारी वेबसाइट पर आते हैं, तो कौन सी जानकारी एकत्र की जा सकती है और उसका उपयोग कैसे किया जाता है।</p>
          <h2 class="text-base font-bold text-slate-900">1. लॉग फाइल्स और एनालिटिक्स</h2>
          <p>अन्य मानक वेबसाइटों की तरह हम लॉग फाइलों और कुकीज़ (Google Analytics) का उपयोग उपयोगकर्ता अनुभव को बेहतर बनाने, पृष्ठ लोड गति को मापने तथा आगंतुकों की संख्या का सांख्यिकीय विश्लेषण करने हेतु करते हैं।</p>
          <h2 class="text-base font-bold text-slate-900">2. कुकीज़ एवं विज्ञापन</h2>
          <p>तृतीय-पक्ष विक्रेता, जिसमें Google शामिल है, हमारी वेबसाइट पर आपके पिछले विज़िट के आधार पर प्रासंगिक विज्ञापन प्रदर्शित करने के लिए कुकीज़ का उपयोग कर सकते हैं।</p>
          <h2 class="text-base font-bold text-slate-900">3. व्यक्तिगत जानकारी की सुरक्षा</h2>
          <p>हम सामान्य पाठकों से कोई संवेदनशील व्यक्तिगत जानकारी (जैसे आधार संख्या, बैंक विवरण अथवा पासवर्ड) कभी नहीं मांगते।</p>
        </article>
      `, canonicalCategories)
    },

    // 10. Terms and Conditions
    {
      route: 'terms-and-conditions',
      title: 'नियम एवं शर्तें (Terms & Conditions) | MP Exam Update',
      description: 'MP Exam Update वेबसाइट के उपयोग के वैधानिक नियम, बौद्धिक संपदा अधिकार और सामग्री उपयोग की अनिवार्य शर्तें।',
      canonicalUrl: `${BASE_URL}/terms-and-conditions`,
      ogType: 'website',
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>नियम एवं शर्तें (Terms &amp; Conditions)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">नियम एवं शर्तें (Terms and Conditions)</h1>
          <p>MP Exam Update (mpexamupdates.in) वेबसाइट का उपयोग करके आप निम्नलिखित नियमों एवं शर्तों से सहमत होते हैं:</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>MP Exam Update पर प्रकाशित सामग्री केवल सूचनात्मक एवं शैक्षणिक मार्गदर्शन के उद्देश्य से है।</li>
            <li>हम सभी सूचनाओं की प्रामाणिकता सुनिश्चित करने का हर संभव प्रयास करते हैं, परंतु किसी भी विसंगति के लिए संबंधित विभाग का आधिकारिक गजट/नोटिफिकेशन ही अंतिम रूप से मान्य होगा।</li>
            <li>हमारी वेबसाइट से किसी भी सामग्री को व्यावसायिक लाभ हेतु अनधिकृत रूप से कॉपी या स्क्रैप करना वर्जित है।</li>
            <li>वेबसाइट पर दिए गए बाहरी आधिकारिक लिंक उम्मीदवारों की सुविधा के लिए हैं।</li>
          </ul>
        </article>
      `, canonicalCategories)
    },

    // 11. Disclaimer
    {
      route: 'disclaimer',
      title: 'अस्वीकरण (Legal Disclaimer) | MP Exam Update',
      description: 'MP Exam Update का आधिकारिक वैधानिक अस्वीकरण। हम एक स्वतंत्र शैक्षणिक सूचना मंच हैं। आवेदन से पूर्व आधिकारिक विज्ञप्ति से पुष्टि करें।',
      canonicalUrl: `${BASE_URL}/disclaimer`,
      ogType: 'website',
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>अस्वीकरण (Disclaimer)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">वैधानिक अस्वीकरण (Legal Disclaimer)</h1>
          <p class="font-semibold text-amber-900 bg-amber-50 p-4 rounded-xl border border-amber-200">
            यह जानकारी केवल सामान्य सूचना के उद्देश्य से दी गई है। आवेदन करने से पहले संबंधित विभाग की आधिकारिक वेबसाइट और आधिकारिक नोटिफिकेशन अवश्य देखें।
          </p>
          <p>mpexamupdates.in मध्य प्रदेश शासन, भारत सरकार, मध्य प्रदेश लोक सेवा आयोग (MPPSC), मध्य प्रदेश कर्मचारी चयन मंडल (MPESB) या किसी भी अन्य सरकारी निकाय से प्रत्यक्ष अथवा अप्रत्यक्ष रूप से संबद्ध नहीं है।</p>
          <p>अभ्यर्थियों को सलाह दी जाती है कि वे अंतिम तिथि, पात्रता, शुल्क एवं रिक्तियों की संख्या की पुष्टि सदैव मूल विभागीय विज्ञापन से करें।</p>
        </article>
      `, canonicalCategories)
    },

    // 12. Advertisement Policy
    {
      route: 'advertisement',
      title: 'विज्ञापन नीति एवं सहयोग (Advertisement Policy) | MP Exam Update',
      description: 'MP Exam Update पर शैक्षणिक विज्ञापन, कोचिंग स्पॉन्सरशिप एवं ब्रांड साझेदारी की पारदर्शी विज्ञापन नीति और संपर्क विवरण।',
      canonicalUrl: `${BASE_URL}/advertisement`,
      ogType: 'website',
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>विज्ञापन नीति (Advertisement Policy)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700 leading-relaxed">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">विज्ञापन नीति (Advertisement Policy)</h1>
          <p>MP Exam Update पोर्टल के सुचारू संचालन और सर्वर लागत को वहन करने के लिए हम स्वच्छ, सुरक्षित एवं प्रासंगिक शैक्षणिक विज्ञापन प्रदर्शित करते हैं।</p>
          <h2 class="text-base font-bold text-slate-900">हमारी विज्ञापन प्रतिबद्धता:</h2>
          <ul class="list-disc pl-5 space-y-2">
            <li>हम किसी भी भ्रामक, अश्लील या छात्रों के हित के विरुद्ध विज्ञापनों को स्वीकार नहीं करते।</li>
            <li>सभी विज्ञापन स्थानों को स्पष्ट रूप से चिह्नित किया जाता है और वे पठन सामग्री में बाधा नहीं डालते।</li>
            <li>अपनी कोचिंग संस्था, टेस्ट सीरीज़ या पुस्तक प्रकाशन के विज्ञापन हेतु हमें <a href="mailto:contact@mpexamupdates.in" class="text-blue-700 hover:underline">contact@mpexamupdates.in</a> पर संपर्क करें।</li>
          </ul>
        </article>
      `, canonicalCategories)
    },

    // 13. HTML Sitemap
    {
      route: 'sitemap',
      title: 'साइटमैप (HTML Sitemap) | MP Exam Update',
      description: 'MP Exam Update पोर्टल के सभी मुख्य पृष्ठों, भर्ती श्रेणियों, नवीनतम सरकारी नौकरियों, एडमिट कार्ड और रिजल्ट की संपूर्ण डायरेक्टरी।',
      canonicalUrl: `${BASE_URL}/sitemap`,
      ogType: 'website',
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500"><a href="/" class="hover:underline">होम</a> / <span>साइटमैप (HTML Sitemap)</span></nav>
        <article class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">MP Exam Update — संपूर्ण साइटमैप (HTML Sitemap)</h1>
          <div>
            <h2 class="text-lg font-bold text-slate-900 mb-2">मुख्य पृष्ठ (Core Pages)</h2>
            <ul class="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li><a href="/">होमपेज (Home)</a></li>
              <li><a href="/jobs">नवीनतम सरकारी नौकरियां (Latest Jobs)</a></li>
              <li><a href="/admit-cards">प्रवेश पत्र (Admit Cards)</a></li>
              <li><a href="/results">परीक्षा परिणाम (Exam Results)</a></li>
              <li><a href="/answer-keys">उत्तर कुंजी (Answer Keys)</a></li>
              <li><a href="/categories">सभी श्रेणियां (All Categories)</a></li>
              <li><a href="/about">हमारे बारे में (About Us)</a></li>
              <li><a href="/contact">संपर्क करें (Contact Us)</a></li>
              <li><a href="/privacy-policy">गोपनीयता नीति (Privacy Policy)</a></li>
              <li><a href="/terms-and-conditions">नियम एवं शर्तें (Terms &amp; Conditions)</a></li>
              <li><a href="/disclaimer">अस्वीकरण (Disclaimer)</a></li>
              <li><a href="/advertisement">विज्ञापन नीति (Advertisement)</a></li>
            </ul>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 mb-2">भर्ती श्रेणियां (Recruitment Categories)</h2>
            <ul class="list-disc pl-5 space-y-1 text-sm text-blue-700">
              ${canonicalCategories.map(c => `<li><a href="/category/${escapeAttr(c.slug)}">${escapeHtml(c.nameHindi)} (${escapeHtml(c.nameEnglish)})</a></li>`).join('')}
            </ul>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 mb-2">प्रकाशित भर्ती एवं परीक्षा अधिसूचनाएं (Published Job Notifications)</h2>
            <ul class="list-disc pl-5 space-y-1 text-sm text-blue-700">
              ${posts.map(p => `<li><a href="/job/${escapeAttr(normalizePostSlug(p.slug))}">${escapeHtml(p.titleHindi || p.title)}</a></li>`).join('')}
            </ul>
          </div>
        </article>
      `, canonicalCategories)
    },

    // 14. 404 Page
    {
      route: '404',
      title: '404 - पृष्ठ नहीं मिला (Page Not Found) | MP Exam Update',
      description: 'क्षमा करें, आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है। नवीनतम एमपी सरकारी नौकरी एवं परीक्षा अपडेट देखें।',
      canonicalUrl: `${BASE_URL}/404`,
      ogType: 'website',
      noindex: true,
      prerenderHtml: buildSharedShell(`
        <div class="max-w-lg mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <h1 class="text-3xl font-black text-slate-900">404 - पृष्ठ नहीं मिला</h1>
          <p class="text-slate-600 text-sm">आप जिस वेब पते (URL) को खोलने का प्रयास कर रहे हैं, वह हटा दिया गया है या बदल दिया गया है।</p>
          <div class="pt-4 flex flex-wrap justify-center gap-3">
            <a href="/" class="inline-block px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold">मुख्य पृष्ठ पर जाएं</a>
            <a href="/jobs" class="inline-block px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl text-sm font-bold">नवीनतम नौकरियां देखें</a>
          </div>
        </div>
      `, canonicalCategories)
    }
  ];

  // 2. Category Hubs (/category/:slug)
  for (const cat of canonicalCategories) {
    const canonicalSlug = cat.slug;
    const catName = cat.nameHindi || cat.nameEnglish || canonicalSlug;
    const catNameEn = cat.nameEnglish || canonicalSlug;
    const matchingPosts = posts.filter(p => doesPostMatchCategory(p, cat, canonicalSlug));
    const displayPosts = matchingPosts.length > 0 ? matchingPosts : posts.slice(0, 6);
    const catDescription = cat.description
      ? `${cat.description}। ${catName} (${catNameEn}) 2026 की नवीनतम भर्ती विज्ञप्ति, पात्रता, परीक्षा तिथि, एडमिट कार्ड और परिणाम।`
      : `${catName} (${catNameEn}) 2026 से जुड़ी सभी नवीनतम सरकारी नौकरियां, ऑनलाइन आवेदन, परीक्षा तिथियां, एडमिट कार्ड और परिणाम की आधिकारिक अपडेट।`;

    routes.push({
      route: `category/${canonicalSlug}`,
      title: `${catName} (${catNameEn}) भर्ती एवं परीक्षा अपडेट 2026 | MP Exam Update`,
      description: catDescription.slice(0, 165),
      canonicalUrl: `${BASE_URL}/category/${canonicalSlug}`,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          'name': `${catName} (${catNameEn}) भर्ती एवं परीक्षा अपडेट 2026`,
          'description': catDescription,
          'url': `${BASE_URL}/category/${canonicalSlug}`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'होम', 'item': `${BASE_URL}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'श्रेणियां', 'item': `${BASE_URL}/categories` },
            { '@type': 'ListItem', 'position': 3, 'name': catName, 'item': `${BASE_URL}/category/${canonicalSlug}` }
          ]
        }
      ],
      prerenderHtml: buildSharedShell(`
        <nav aria-label="Breadcrumb" class="text-xs text-slate-500">
          <a href="/" class="hover:underline">होम</a> / 
          <a href="/categories" class="hover:underline">श्रेणियां</a> / 
          <span>${escapeHtml(catName)}</span>
        </nav>
        <section class="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900">${escapeHtml(catName)} (${escapeHtml(catNameEn)}) — भर्ती, एडमिट कार्ड एवं रिजल्ट 2026</h1>
          <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(catDescription)}</p>
        </section>
        <section class="space-y-4">
          <h2 class="text-lg font-bold text-slate-900">
            ${matchingPosts.length > 0 ? `${escapeHtml(catName)} की नवीनतम अधिसूचनाएं (${matchingPosts.length})` : `${escapeHtml(catName)} एवं अन्य प्रमुख सक्रिय भर्तियां`}
          </h2>
          ${renderPostsListHtml(displayPosts, 'इस श्रेणी में नई अधिसूचनाएं जल्द जोड़ी जाएंगी।')}
        </section>
      `, canonicalCategories)
    });
  }

  // 3. Published Post Single Pages (/job/:slug)
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const cleanSlug = normalizePostSlug(post.slug);
    if (!cleanSlug) continue;

    const rawDesc = post.seoDescription || post.excerpt || post.content || `${post.titleHindi || post.title} - पात्रता, आयु सीमा, चयन प्रक्रिया, महत्वपूर्ण तिथियां एवं आधिकारिक अधिसूचना।`;
    const cleanSummary = stripHtml(rawDesc).slice(0, 160);
    const postUrl = `${BASE_URL}/job/${cleanSlug}`;
    const rawTitle = post.seoTitle || post.titleHindi || post.title;
    const postTitle = rawTitle.includes('MP Exam Update') ? rawTitle : `${rawTitle} | MP Exam Update`;
    const lastDate = post.applicationLastDate || 'विज्ञप्ति अनुसार';
    const dept = post.organization || 'मध्य प्रदेश शासन';
    const vacancies = post.vacancy || 'विज्ञप्ति अनुसार';
    const expired = isJobExpired(post.applicationLastDate);

    // Determine category slug & name for breadcrumbs and internal linking
    const matchedCat = canonicalCategories.find(
      c => c.id === post.categoryId || c.slug === normalizeCategorySlug(post.category || post.categoryId)
    ) || canonicalCategories.find(c => doesPostMatchCategory(post, c, c.slug));
    const catSlug = matchedCat?.slug || normalizeCategorySlug(post.category || post.categoryId) || 'sarkari-naukri';
    const catName = matchedCat?.nameHindi || post.categoryName || post.category || 'सरकारी भर्ती';

    // Determine related posts + previous/next recruitment updates for strong internal linking
    const sameCatPosts = posts.filter(p => p.id !== post.id && doesPostMatchCategory(p, matchedCat, catSlug));
    const otherPosts = posts.filter(p => p.id !== post.id && !sameCatPosts.some(sp => sp.id === p.id));
    const relatedPosts = [...sameCatPosts, ...otherPosts].slice(0, 4);
    const prevPost = i > 0 ? posts[i - 1] : null;
    const nextPost = i < posts.length - 1 ? posts[i + 1] : null;

    const schemas: any[] = [];

    // 1. Article schema
    const articleLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.titleHindi || post.title,
      'name': post.titleHindi || post.title,
      'description': cleanSummary,
      'url': postUrl,
      'author': {
        '@type': 'Organization',
        'name': 'MP Exam Update Editorial Team',
        'url': `${BASE_URL}/about`
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'MP Exam Update',
        'url': `${BASE_URL}/`,
        'logo': {
          '@type': 'ImageObject',
          'url': `${BASE_URL}/og-banner.svg`
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': postUrl
      }
    };

    const pubDate = safeIsoDate(post.publishedAt) || safeIsoDate(post.createdAt);
    if (pubDate) {
      articleLd.datePublished = pubDate;
    }
    const modDate = safeIsoDate(post.updatedAt) || pubDate;
    if (modDate) {
      articleLd.dateModified = modDate;
    }
    schemas.push(articleLd);

    // 2. BreadcrumbList schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'होम',
          'item': `${BASE_URL}/`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': catName,
          'item': `${BASE_URL}/category/${catSlug}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': post.titleHindi || post.title,
          'item': postUrl
        }
      ]
    });

    // 3. JobPosting schema ONLY if post represents an active (non-expired) genuine job
    if (post.postType === 'job' && !expired) {
      const jobLd: any = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        'title': post.title || post.titleHindi,
        'description': cleanSummary,
        'hiringOrganization': {
          '@type': 'Organization',
          'name': dept
        },
        'jobLocation': {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressRegion': post.location || 'Madhya Pradesh',
            'addressCountry': 'IN'
          }
        }
      };

      if (post.officialWebsite && post.officialWebsite.startsWith('http') && !post.officialWebsite.includes('mpexamupdates.in')) {
        jobLd.hiringOrganization.sameAs = post.officialWebsite;
      }

      if (pubDate) {
        jobLd.datePosted = pubDate.split('T')[0];
      }

      const validThroughYmd = formatDateToYMD(post.applicationLastDate);
      if (validThroughYmd) {
        jobLd.validThrough = validThroughYmd;
      }

      if (post.employmentType) {
        jobLd.employmentType = post.employmentType;
      }

      schemas.push(jobLd);
    }

    // 4. FAQ schema ONLY if genuine visible FAQs present
    const validFaqs = (post.faqs || []).filter((f: any) => f.question?.trim() && f.answer?.trim());
    if (validFaqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': validFaqs.map((f: any) => ({
          '@type': 'Question',
          'name': f.question.trim(),
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer.trim()
          }
        }))
      });
    }

    const postJsonLd = schemas.length === 1 ? schemas[0] : schemas;

    const prerenderArticleHtml = buildSharedShell(`
      <nav aria-label="Breadcrumb" class="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
        <a href="/" class="hover:underline">होम</a>
        <span>/</span>
        <a href="/category/${escapeAttr(catSlug)}" class="hover:underline">${escapeHtml(catName)}</a>
        <span>/</span>
        <span class="text-slate-800 font-semibold">${escapeHtml(post.titleHindi || post.title)}</span>
      </nav>

      <article class="bg-white p-6 sm:p-8 rounded-2xl shadow-2xs border border-slate-200 space-y-6">
        <header class="border-b border-slate-200 pb-5 space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <a href="/category/${escapeAttr(catSlug)}" class="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md">${escapeHtml(catName)}</a>
            <span class="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md">${escapeHtml(dept)}</span>
            <span class="${expired ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'} font-bold px-2.5 py-0.5 rounded-md">
              ${expired ? 'आवेदन बंद (Application Closed)' : 'सक्रिय भर्ती (Active)'}
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">${escapeHtml(post.titleHindi || post.title)}</h1>
          ${post.title && post.titleHindi && post.title !== post.titleHindi ? `<h2 class="text-base text-slate-600 font-medium">${escapeHtml(post.title)}</h2>` : ''}
        </header>

        ${post.excerpt ? `<div class="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-sm text-slate-800 leading-relaxed">${escapeHtml(stripHtml(post.excerpt))}</div>` : ''}

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div><span class="text-slate-500 block">विभाग / आयोग</span><strong class="text-slate-900">${escapeHtml(dept)}</strong></div>
          <div><span class="text-slate-500 block">कुल पद (Vacancy)</span><strong class="text-blue-700 font-bold">${escapeHtml(vacancies)}</strong></div>
          <div><span class="text-slate-500 block">शैक्षणिक योग्यता</span><strong class="text-slate-900">${escapeHtml(post.qualification || 'विज्ञप्ति देखें')}</strong></div>
          <div><span class="text-slate-500 block">अंतिम तिथि</span><strong class="${expired ? 'text-slate-600' : 'text-red-600'} font-bold">${escapeHtml(lastDate)}</strong></div>
        </div>

        <section class="space-y-2">
          <h3 class="text-base font-bold text-slate-900">महत्वपूर्ण तिथियां (Important Dates)</h3>
          <table class="w-full text-left text-xs sm:text-sm border border-slate-200">
            <tbody>
              <tr class="border-b border-slate-200"><th class="p-2.5 bg-slate-50">आवेदन प्रारंभ तिथि</th><td class="p-2.5">${escapeHtml(post.applicationStartDate || 'विज्ञप्ति अनुसार')}</td></tr>
              <tr class="border-b border-slate-200"><th class="p-2.5 bg-slate-50">आवेदन अंतिम तिथि</th><td class="p-2.5 font-bold">${escapeHtml(lastDate)}</td></tr>
              ${post.examDate ? `<tr><th class="p-2.5 bg-slate-50">परीक्षा तिथि (Exam Date)</th><td class="p-2.5">${escapeHtml(post.examDate)}</td></tr>` : ''}
            </tbody>
          </table>
        </section>

        ${post.applicationFee ? `
          <section class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">आवेदन शुल्क (Application Fee)</h3>
            <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line">${escapeHtml(post.applicationFee)}</p>
          </section>
        ` : ''}

        ${(post.ageLimit || post.salary) ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            ${post.ageLimit ? `<div class="p-3 bg-slate-50 rounded-xl border border-slate-200"><strong>आयु सीमा (Age Limit):</strong> ${escapeHtml(post.ageLimit)}</div>` : ''}
            ${post.salary ? `<div class="p-3 bg-slate-50 rounded-xl border border-slate-200"><strong>वेतनमान (Salary):</strong> ${escapeHtml(post.salary)}</div>` : ''}
          </div>
        ` : ''}

        ${post.selectionProcess ? `
          <section class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">चयन प्रक्रिया (Selection Process)</h3>
            <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line">${escapeHtml(post.selectionProcess)}</p>
          </section>
        ` : ''}

        ${post.examPattern ? `
          <section class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">परीक्षा पैटर्न (Exam Pattern)</h3>
            <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line">${escapeHtml(post.examPattern)}</p>
          </section>
        ` : ''}

        ${post.syllabus ? `
          <section class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">पाठ्यक्रम (Syllabus)</h3>
            <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line">${escapeHtml(post.syllabus)}</p>
          </section>
        ` : ''}

        ${post.content ? `
          <section class="space-y-2">
            <h3 class="text-base font-bold text-slate-900">विस्तृत भर्ती विवरण (Detailed Overview)</h3>
            <div class="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">${escapeHtml(stripHtml(post.content))}</div>
          </section>
        ` : ''}

        ${post.howToApply ? `
          <section class="space-y-1">
            <h3 class="text-base font-bold text-slate-900">ऑनलाइन आवेदन कैसे करें (How to Apply)</h3>
            <p class="text-xs sm:text-sm text-slate-700 whitespace-pre-line">${escapeHtml(post.howToApply)}</p>
          </section>
        ` : ''}

        <section class="border-t border-slate-200 pt-5">
          <h3 class="text-base font-bold text-slate-900 mb-3">महत्वपूर्ण आधिकारिक लिंक (Important Official Links)</h3>
          <ul class="space-y-2 text-sm">
            ${post.applyLink ? `<li><a href="${escapeAttr(post.applyLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">${expired ? 'ऑनलाइन आवेदन पोर्टल (आवेदन अवधि समाप्त)' : 'ऑनलाइन आवेदन करें (Apply Online)'}</a></li>` : ''}
            ${(post.notificationPdf || post.notificationLink) ? `<li><a href="${escapeAttr(post.notificationPdf || post.notificationLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">आधिकारिक अधिसूचना पीडीएफ (Download Official Notification PDF)</a></li>` : ''}
            ${post.admitCardLink ? `<li><a href="${escapeAttr(post.admitCardLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">प्रवेश पत्र डाउनलोड करें (Download Admit Card)</a></li>` : ''}
            ${post.resultLink ? `<li><a href="${escapeAttr(post.resultLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">परीक्षा परिणाम देखें (Check Exam Result)</a></li>` : ''}
            ${post.answerKeyLink ? `<li><a href="${escapeAttr(post.answerKeyLink)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">उत्तर कुंजी डाउनलोड करें (Download Answer Key)</a></li>` : ''}
            ${post.officialWebsite ? `<li><a href="${escapeAttr(post.officialWebsite)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">विभाग की आधिकारिक वेबसाइट (Official Website)</a></li>` : ''}
          </ul>
        </section>

        ${validFaqs.length > 0 ? `
          <section class="border-t border-slate-200 pt-5 space-y-3">
            <h3 class="text-base font-bold text-slate-900">अक्सर पूछे जाने वाले प्रश्न (FAQs)</h3>
            ${validFaqs.map((f: any) => `
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 class="font-bold text-xs sm:text-sm text-slate-900">${escapeHtml(f.question)}</h4>
                <p class="text-xs text-slate-700 mt-1">${escapeHtml(f.answer)}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}
      </article>

      ${(prevPost || nextPost) ? `
        <nav aria-label="Previous and Next Recruitment Updates" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${prevPost ? `
            <a href="/job/${escapeAttr(normalizePostSlug(prevPost.slug))}" class="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 block">
              <span class="text-xs text-slate-500 block">← पिछली भर्ती अपडेट (Previous Update)</span>
              <strong class="text-sm text-blue-800 font-bold">${escapeHtml(prevPost.titleHindi || prevPost.title)}</strong>
            </a>
          ` : '<div></div>'}
          ${nextPost ? `
            <a href="/job/${escapeAttr(normalizePostSlug(nextPost.slug))}" class="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 block text-right">
              <span class="text-xs text-slate-500 block">आगामी भर्ती अपडेट (Next Update) →</span>
              <strong class="text-sm text-blue-800 font-bold">${escapeHtml(nextPost.titleHindi || nextPost.title)}</strong>
            </a>
          ` : '<div></div>'}
        </nav>
      ` : ''}

      ${relatedPosts.length > 0 ? `
        <section class="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">संबंधित अन्य महत्वपूर्ण भर्तियां (Related Jobs &amp; Exam Updates)</h2>
            <a href="/category/${escapeAttr(catSlug)}" class="text-xs font-bold text-blue-700 hover:underline">${escapeHtml(catName)} की सभी भर्तियां →</a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${relatedPosts.map(rel => `
              <a href="/job/${escapeAttr(normalizePostSlug(rel.slug))}" class="p-3 rounded-xl border border-slate-200 hover:border-blue-400 block">
                <strong class="text-sm text-blue-800 font-bold block">${escapeHtml(rel.titleHindi || rel.title)}</strong>
                <span class="text-xs text-slate-500">${escapeHtml(rel.organization || 'मध्य प्रदेश शासन')} • अंतिम तिथि: ${escapeHtml(rel.applicationLastDate || 'विज्ञप्ति देखें')}</span>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}
    `, canonicalCategories);

    routes.push({
      route: `job/${cleanSlug}`,
      title: postTitle,
      description: cleanSummary,
      canonicalUrl: normalizeCanonicalUrl(postUrl),
      ogType: 'article',
      ogImage: post.featuredImage ? normalizeCanonicalUrl(post.featuredImage) : `${BASE_URL}/og-banner.svg`,
      jsonLd: postJsonLd,
      prerenderHtml: prerenderArticleHtml
    });
  }

  // Generate HTML files
  let generatedCount = 0;
  for (const meta of routes) {
    let html = baseHtml;
    const cleanCanonical = normalizeCanonicalUrl(meta.canonicalUrl);
    const cleanOgImage = (meta.ogImage || `${BASE_URL}/og-banner.svg`).replace(
      /^https?:\/\/(www\.)?mpexamupdates\.in/i,
      BASE_URL
    );

    // 1. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

    // 2. Replace Meta Description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttr(meta.description)}" />`);
    } else {
      html = html.replace('</head>', `    <meta name="description" content="${escapeAttr(meta.description)}" />\n  </head>`);
    }

    // 3. Inject / Replace Canonical URL
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttr(cleanCanonical)}" />`);
    } else {
      html = html.replace('</head>', `    <link rel="canonical" href="${escapeAttr(cleanCanonical)}" />\n  </head>`);
    }

    // 4. Update OpenGraph & Twitter Tags
    const ogTitleTag = `<meta property="og:title" content="${escapeAttr(meta.title)}" />`;
    const ogDescTag = `<meta property="og:description" content="${escapeAttr(meta.description)}" />`;
    const ogUrlTag = `<meta property="og:url" content="${escapeAttr(cleanCanonical)}" />`;
    const ogTypeTag = `<meta property="og:type" content="${escapeAttr(meta.ogType || 'website')}" />`;
    const ogImageTag = `<meta property="og:image" content="${escapeAttr(cleanOgImage)}" />`;

    const twitterTitleTag = `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`;
    const twitterDescTag = `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`;
    const twitterImageTag = `<meta name="twitter:image" content="${escapeAttr(cleanOgImage)}" />`;

    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, ogTitleTag);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, ogDescTag);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, ogUrlTag);
    html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, ogTypeTag);
    html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, ogImageTag);

    if (html.includes('name="twitter:title"')) {
      html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, twitterTitleTag);
    } else {
      html = html.replace('</head>', `    ${twitterTitleTag}\n  </head>`);
    }
    if (html.includes('name="twitter:description"')) {
      html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, twitterDescTag);
    } else {
      html = html.replace('</head>', `    ${twitterDescTag}\n  </head>`);
    }
    if (html.includes('name="twitter:image"')) {
      html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, twitterImageTag);
    } else {
      html = html.replace('</head>', `    ${twitterImageTag}\n  </head>`);
    }

    // 5. Replace Structured Data JSON-LD (#seo-json-ld) without creating duplicates
    if (meta.jsonLd) {
      const jsonLdJson = JSON.stringify(meta.jsonLd, null, 2);
      if (html.includes('id="seo-json-ld"')) {
        html = html.replace(
          /<script\s+id="seo-json-ld"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
          `<script id="seo-json-ld" type="application/ld+json">\n${jsonLdJson}\n    </script>`
        );
      } else {
        html = html.replace('</head>', `    <script id="seo-json-ld" type="application/ld+json">\n${jsonLdJson}\n    </script>\n  </head>`);
      }
    }

    // 6. Inject Semantic Prerendered Content into <div id="root"> safely using PRERENDER_START/END markers
    if (meta.prerenderHtml) {
      if (html.includes('<!--PRERENDER_START-->') && html.includes('<!--PRERENDER_END-->')) {
        html = html.replace(
          /<!--PRERENDER_START-->[\s\S]*?<!--PRERENDER_END-->/i,
          `<!--PRERENDER_START-->${meta.prerenderHtml}<!--PRERENDER_END-->`
        );
      } else {
        html = html.replace(
          /<div id="root">[\s\S]*?<\/main>\s*<\/div>/i,
          `<div id="root"><!--PRERENDER_START-->${meta.prerenderHtml}<!--PRERENDER_END--></div>`
        );
      }
    }

    // 7. Robots directive for noindex routes (e.g. 404)
    if (meta.noindex) {
      if (html.includes('<meta name="robots"')) {
        html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex, follow" />');
      } else {
        html = html.replace('</head>', '    <meta name="robots" content="noindex, follow" />\n  </head>');
      }
    }

    // Determine target file path
    const targetDir = meta.route ? path.resolve(distDir, meta.route) : distDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.resolve(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf-8');
    if (meta.route === '404') {
      fs.writeFileSync(path.resolve(distDir, '404.html'), html, 'utf-8');
    }
    generatedCount++;
  }

  console.log(`[Prerender] Prerendering complete! Generated ${generatedCount} static HTML pages in dist/`);

  // Also write the fresh sitemap
  await generateAndWriteSitemap();
}

// Auto-run if executed via tsx
if (process.argv[1] && process.argv[1].endsWith('prerender.ts')) {
  runPrerender().then(() => {
    process.exit(0);
  });
}
