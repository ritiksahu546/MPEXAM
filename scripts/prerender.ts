import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, terminate } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';
import { INITIAL_POSTS, INITIAL_CATEGORIES } from '../src/data/initialData';
import { Post, Category } from '../src/types';
import { generateAndWriteSitemap } from './build-sitemap';

const BASE_URL = 'https://www.mpexamupdates.in';

interface RouteMetadata {
  route: string;
  title: string;
  description: string;
  canonicalUrl: string;
  noindex?: boolean;
  ogType?: string;
  ogImage?: string;
  jsonLd?: object;
  prerenderHtml?: string;
}

/**
 * Strips HTML tags for safe meta description insertion.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

/**
 * Escapes HTML attributes for safe meta injection.
 */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Safely converts arbitrary date strings to ISO strings without throwing RangeError.
 */
function safeIsoDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return undefined;
  }
  return d.toISOString();
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

    const catSnap = await getDocs(collection(db, 'categories'));
    const firestoreCats = catSnap.docs.map(d => ({ ...d.data(), id: d.id } as Category));

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

export async function runPrerender(): Promise<void> {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.resolve(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.warn('[Prerender] dist/index.html not found. Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');
  const { posts, categories } = await fetchPublishedData();

  console.log(`[Prerender] Starting static prerendering for ${posts.length} published posts and ${categories.length} categories...`);

  // Build route list
  const routes: RouteMetadata[] = [
    // 1. Core Pages
    {
      route: '',
      title: 'MP Exam Update - मध्य प्रदेश सरकारी नौकरी एवं परीक्षा पोर्टल 2026',
      description: 'MP Exam Update: मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB (व्यापम), पुलिस भर्ती, शिक्षक भर्ती, एडमिट कार्ड, रिजल्ट और आंसर-की की नवीनतम अपडेट।',
      canonicalUrl: `${BASE_URL}/`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'MP Exam Update',
        'url': BASE_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    },
    {
      route: 'jobs',
      title: 'मध्य प्रदेश नवीनतम सरकारी नौकरियां (MP Latest Jobs 2026) | MP Exam Update',
      description: 'मध्य प्रदेश की नवीनतम सरकारी नौकरियां, एमपीपीएससी, व्यापम, पुलिस कांस्टेबल और शिक्षक भर्ती 2026 की पूरी जानकारी व ऑनलाइन आवेदन लिंक।',
      canonicalUrl: `${BASE_URL}/jobs`,
      ogType: 'website'
    },
    {
      route: 'admit-cards',
      title: 'मध्य प्रदेश प्रवेश पत्र (MP Admit Card 2026) डाउनलोड | MP Exam Update',
      description: 'MPPSC, MPESB (व्यापम), पुलिस और अन्य एमपी प्रतियोगी परीक्षाओं के एडमिट कार्ड / प्रवेश पत्र डाउनलोड लिंक और परीक्षा निर्देश।',
      canonicalUrl: `${BASE_URL}/admit-cards`,
      ogType: 'website'
    },
    {
      route: 'results',
      title: 'मध्य प्रदेश परीक्षा परिणाम (MP Sarkari Results 2026) | MP Exam Update',
      description: 'मध्य प्रदेश सरकारी परीक्षा परिणाम, चयन सूची, मेरिट लिस्ट और कट-ऑफ अंक 2026 की त्वरित जानकारी।',
      canonicalUrl: `${BASE_URL}/results`,
      ogType: 'website'
    },
    {
      route: 'answer-keys',
      title: 'उत्तर कुंजी (MP Exam Answer Key 2026) | MP Exam Update',
      description: 'मध्य प्रदेश प्रतियोगी परीक्षाओं की आधिकारिक उत्तर कुंजी, मॉडल उत्तर और आपत्ति दर्ज करने के सीधे लिंक।',
      canonicalUrl: `${BASE_URL}/answer-keys`,
      ogType: 'website'
    },
    {
      route: 'categories',
      title: 'सभी श्रेणियां (All Categories) - MPPSC, MPESB, Police | MP Exam Update',
      description: 'मध्य प्रदेश सरकारी भर्ती एवं परीक्षाओं की सभी प्रमुख श्रेणियां: MPPSC, MPESB व्यापम, पुलिस भर्ती, शिक्षक भर्ती, हाई कोर्ट और केंद्रीय नौकरियां।',
      canonicalUrl: `${BASE_URL}/categories`,
      ogType: 'website'
    },
    {
      route: 'about',
      title: 'हमारे बारे में (About Us) | MP Exam Update',
      description: 'MP Exam Update पोर्टल के उद्देश्य, टीम और मध्य प्रदेश के युवाओं को प्रामाणिक सरकारी भर्ती सूचनाएं प्रदान करने के मिशन की जानकारी।',
      canonicalUrl: `${BASE_URL}/about`,
      ogType: 'website'
    },
    {
      route: 'contact',
      title: 'संपर्क करें (Contact Us) | MP Exam Update',
      description: 'MP Exam Update से संपर्क करें। भर्ती सूचना, विज्ञापन और तकनीकी सहायता के लिए हमारी टीम से जुड़ें।',
      canonicalUrl: `${BASE_URL}/contact`,
      ogType: 'website'
    },
    {
      route: 'privacy-policy',
      title: 'गोपनीयता नीति (Privacy Policy) | MP Exam Update',
      description: 'MP Exam Update की गोपनीयता नीति, कुकीज़ और उपयोगकर्ता डेटा संरक्षण की विस्तृत शर्तें।',
      canonicalUrl: `${BASE_URL}/privacy-policy`,
      ogType: 'website'
    },
    {
      route: 'terms-and-conditions',
      title: 'नियम एवं शर्तें (Terms & Conditions) | MP Exam Update',
      description: 'MP Exam Update पोर्टल के उपयोग के नियम, बौद्धिक संपदा अधिकार और उपयोग शर्तें।',
      canonicalUrl: `${BASE_URL}/terms-and-conditions`,
      ogType: 'website'
    },
    {
      route: 'disclaimer',
      title: 'अस्वीकरण (Disclaimer) | MP Exam Update',
      description: 'MP Exam Update एक स्वतंत्र सूचना पोर्टल है। आधिकारिक पुष्टि और डिस्क्लेमर सूचना।',
      canonicalUrl: `${BASE_URL}/disclaimer`,
      ogType: 'website'
    },
    {
      route: 'advertisement',
      title: 'विज्ञापन एवं सहयोग (Advertisement) | MP Exam Update',
      description: 'MP Exam Update पर विज्ञापन देने, स्पॉन्सरशिप और ब्रांड साझेदारी के अवसर।',
      canonicalUrl: `${BASE_URL}/advertisement`,
      ogType: 'website'
    },
    {
      route: 'sitemap',
      title: 'साइटमैप (HTML Sitemap) | MP Exam Update',
      description: 'MP Exam Update पोर्टल के सभी पेजों, श्रेणियों, भर्ती विज्ञप्तियों, रिजल्ट और एडमिट कार्ड की व्यवस्थित सूची।',
      canonicalUrl: `${BASE_URL}/sitemap`,
      ogType: 'website'
    },
    {
      route: '404',
      title: '404 - पृष्ठ नहीं मिला (Page Not Found) | MP Exam Update',
      description: 'क्षमा करें, आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है। नवीनतम एमपी सरकारी नौकरी एवं परीक्षा अपडेट देखें।',
      canonicalUrl: `${BASE_URL}/404`,
      ogType: 'website',
      noindex: true,
      prerenderHtml: `
        <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div class="max-w-lg w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
            <h1 class="text-3xl font-black text-slate-900">404 - पृष्ठ नहीं मिला</h1>
            <p class="text-slate-600 text-sm">आप जिस वेब पते (URL) को खोलने का प्रयास कर रहे हैं, वह हटा दिया गया है या बदल दिया गया है।</p>
            <div class="pt-4">
              <a href="/" class="inline-block px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold">
                मुख्य पृष्ठ पर जाएं
              </a>
            </div>
          </div>
        </div>
      `
    }
  ];

  // 2. Category Hubs (Deduplicate by canonical slug, mapping central-government-jobs -> central-jobs)
  const canonicalCategoriesMap = new Map<string, Category>();
  for (const cat of categories) {
    if (!cat.slug) continue;
    const cleanSlug = cat.slug.toLowerCase().trim() === 'central-government-jobs' ? 'central-jobs' : cat.slug.toLowerCase().trim();
    if (!canonicalCategoriesMap.has(cleanSlug)) {
      canonicalCategoriesMap.set(cleanSlug, { ...cat, slug: cleanSlug });
    }
  }

  for (const [canonicalSlug, cat] of canonicalCategoriesMap.entries()) {
    const catName = cat.nameHindi || cat.nameEnglish || canonicalSlug;
    routes.push({
      route: `category/${canonicalSlug}`,
      title: `${catName} 2026 - नवीनतम भर्ती, प्रवेश पत्र व परिणाम | MP Exam Update`,
      description: `${cat.description || catName + ' से जुड़ी सभी नवीनतम सरकारी नौकरियां, ऑनलाइन आवेदन, परीक्षा तिथियां, एडमिट कार्ड और परिणाम की अपडेट।' }`,
      canonicalUrl: `${BASE_URL}/category/${canonicalSlug}`,
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': catName,
        'description': cat.description || `${catName} अपडेट्स`,
        'url': `${BASE_URL}/category/${canonicalSlug}`
      },
      prerenderHtml: `
        <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
          <header class="bg-blue-900 text-white py-4 px-6">
            <div class="max-w-5xl mx-auto flex items-center justify-between">
              <a href="/" class="text-xl font-bold tracking-tight">MP EXAM UPDATE</a>
              <a href="/jobs" class="text-sm underline">सभी नौकरियां</a>
            </div>
          </header>
          <main class="max-w-5xl mx-auto px-4 py-8">
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">${catName}</h1>
            <p class="text-slate-600 text-sm mb-6">${cat.description || 'इस श्रेणी के सभी नवीनतम पद एवं अधिसूचनाएं'}</p>
            <div class="space-y-3">
              ${posts
                .filter(p => p.categoryId === cat.id || p.category === canonicalSlug || (canonicalSlug === 'central-jobs' && (p.category === 'central-government-jobs' || p.categoryId === 'central-jobs')))
                .slice(0, 10)
                .map(p => `
                  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <a href="/job/${p.slug}" class="text-blue-700 font-bold hover:underline block">${p.title}</a>
                    <span class="text-xs text-slate-500">अंतिम तिथि: ${p.applicationLastDate || 'अधिसूचना देखें'}</span>
                  </div>
                `).join('') || '<p class="text-slate-500 text-sm">इस श्रेणी में वर्तमान में कोई सक्रिय पोस्ट नहीं है।</p>'}
            </div>
          </main>
        </div>
      `
    });
  }

  // 3. Published Post Single Pages (/job/:slug)
  for (const post of posts) {
    if (!post.slug) continue;
    const cleanSummary = stripHtml(post.excerpt || post.content || post.title).slice(0, 160);
    const postUrl = `${BASE_URL}/job/${post.slug}`;
    const postTitle = `${post.title} | MP Exam Update`;
    const lastDate = post.applicationLastDate || 'जल्द घोषित';
    const dept = post.organization || 'मध्य प्रदेश शासन';
    const vacancies = post.vacancy || 'अधिसूचना देखें';

    const schemas: any[] = [];

    // 1. Article schema
    const articleLd: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': post.title,
      'name': post.title,
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
          'name': post.categoryName || post.category || 'सरकारी भर्ती',
          'item': `${BASE_URL}/category/${post.categoryId || 'mp-jobs'}`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': post.title,
          'item': postUrl
        }
      ]
    });

    // 3. JobPosting schema ONLY if post represents genuine job
    if (post.postType === 'job') {
      const jobLd: any = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        'title': post.title,
        'description': cleanSummary,
        'hiringOrganization': {
          '@type': 'Organization',
          'name': dept
        }
      };

      if (post.officialWebsite && post.officialWebsite.startsWith('http') && !post.officialWebsite.includes('mpexamupdates.in')) {
        jobLd.hiringOrganization.sameAs = post.officialWebsite;
      }

      if (pubDate) {
        jobLd.datePosted = pubDate.split('T')[0];
      }

      const validThroughDate = safeIsoDate(post.applicationLastDate);
      if (validThroughDate) {
        jobLd.validThrough = validThroughDate.split('T')[0];
      }

      if (post.employmentType) {
        jobLd.employmentType = post.employmentType;
      }

      if (post.location) {
        jobLd.jobLocation = {
          '@type': 'Place',
          'address': {
            '@type': 'PostalAddress',
            'addressRegion': post.location,
            'addressCountry': 'IN'
          }
        };
      }

      if (post.salary) {
        jobLd.baseSalary = {
          '@type': 'MonetaryAmount',
          'currency': 'INR',
          'value': {
            '@type': 'QuantitativeValue',
            'value': post.salary
          }
        };
      }

      schemas.push(jobLd);
    }

    // 4. FAQ schema if valid FAQs present
    if (post.faqs && post.faqs.length > 0) {
      const validFaqs = post.faqs.filter((f: any) => f.question?.trim() && f.answer?.trim());
      if (validFaqs.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': validFaqs.map((f: any) => ({
            '@type': 'Question',
            'name': f.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': f.answer
            }
          }))
        });
      }
    }

    const postJsonLd = schemas.length === 1 ? schemas[0] : schemas;

    const prerenderArticleHtml = `
      <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <header class="bg-blue-900 text-white py-4 px-6 shadow-sm">
          <div class="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" class="text-xl font-bold tracking-tight">MP EXAM <span class="text-orange-400">UPDATE</span></a>
            <div class="space-x-3 text-xs sm:text-sm font-medium">
              <a href="/jobs" class="hover:underline">नौकरियां</a>
              <a href="/admit-cards" class="hover:underline">प्रवेश पत्र</a>
              <a href="/results" class="hover:underline">परिणाम</a>
            </div>
          </div>
        </header>
        <main class="max-w-4xl mx-auto px-4 py-8">
          <article class="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200">
            <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-4 flex items-center space-x-2 flex-wrap">
              <a href="/" class="hover:underline">होम</a>
              <span>/</span>
              <a href="/jobs" class="hover:underline">सरकारी नौकरी</a>
              <span>/</span>
              <span class="text-slate-800 font-medium truncate max-w-xs">${post.title}</span>
            </nav>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">${post.title}</h1>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-6">
              <div><span class="text-slate-500 block">विभाग</span><strong class="text-slate-800">${dept}</strong></div>
              <div><span class="text-slate-500 block">कुल पद</span><strong class="text-blue-700 font-bold">${vacancies}</strong></div>
              <div><span class="text-slate-500 block">योग्यता</span><strong class="text-slate-800">${post.qualification || 'अधिसूचना देखें'}</strong></div>
              <div><span class="text-slate-500 block">अंतिम तिथि</span><strong class="text-red-600 font-bold">${lastDate}</strong></div>
            </div>
            <div class="prose max-w-none text-slate-800 text-sm leading-relaxed">
              <p class="mb-4 text-slate-700 font-medium">${cleanSummary}</p>
              <div class="border-t border-slate-200 pt-6 mt-6">
                <h2 class="text-base font-bold text-slate-900 mb-3">महत्वपूर्ण लिंक (Important Quick Links)</h2>
                <ul class="space-y-2 text-sm">
                  ${post.applyLink ? `<li><a href="${post.applyLink}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">✓ ऑनलाइन आवेदन करें (Apply Online)</a></li>` : ''}
                  ${(post.notificationPdf || post.notificationLink) ? `<li><a href="${post.notificationPdf || post.notificationLink}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">✓ आधिकारिक अधिसूचना पीडीएफ (Download Notification PDF)</a></li>` : ''}
                  ${post.officialWebsite ? `<li><a href="${post.officialWebsite}" target="_blank" rel="noopener noreferrer" class="text-blue-700 font-semibold hover:underline">✓ आधिकारिक वेबसाइट (Official Website)</a></li>` : ''}
                </ul>
              </div>
            </div>
          </article>
        </main>
      </div>
    `;

    routes.push({
      route: `job/${post.slug}`,
      title: postTitle,
      description: cleanSummary,
      canonicalUrl: postUrl,
      ogType: 'article',
      jsonLd: postJsonLd,
      prerenderHtml: prerenderArticleHtml
    });
  }

  // Generate HTML files
  let generatedCount = 0;
  for (const meta of routes) {
    let html = baseHtml;

    // 1. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);

    // 2. Replace Meta Description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeAttr(meta.description)}">`);
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${escapeAttr(meta.description)}">\n</head>`);
    }

    // 3. Inject / Replace Canonical URL
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${meta.canonicalUrl}">`);
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${meta.canonicalUrl}">\n</head>`);
    }

    // 4. Update OpenGraph & Twitter Tags
    const ogTitleTag = `<meta property="og:title" content="${escapeAttr(meta.title)}">`;
    const ogDescTag = `<meta property="og:description" content="${escapeAttr(meta.description)}">`;
    const ogUrlTag = `<meta property="og:url" content="${meta.canonicalUrl}">`;
    const ogTypeTag = `<meta property="og:type" content="${meta.ogType || 'website'}">`;
    const ogImageTag = `<meta property="og:image" content="${meta.ogImage || `${BASE_URL}/og-banner.svg`}">`;

    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, ogTitleTag);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, ogDescTag);

    // Update or insert og:url, og:image, og:type
    if (!html.includes('property="og:url"')) {
      html = html.replace('</head>', `  ${ogUrlTag}\n</head>`);
    } else {
      html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, ogUrlTag);
    }
    if (!html.includes('property="og:image"')) {
      html = html.replace('</head>', `  ${ogImageTag}\n</head>`);
    } else {
      html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, ogImageTag);
    }
    if (!html.includes('property="og:type"')) {
      html = html.replace('</head>', `  ${ogTypeTag}\n</head>`);
    } else {
      html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, ogTypeTag);
    }

    // 5. Inject Structured Data JSON-LD
    if (meta.jsonLd) {
      const jsonLdTag = `\n  <script type="application/ld+json">\n${JSON.stringify(meta.jsonLd, null, 2)}\n  </script>`;
      html = html.replace('</head>', `${jsonLdTag}\n</head>`);
    }

    // 6. Inject Semantic Prerendered Content into <div id="root">
    if (meta.prerenderHtml) {
      html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${meta.prerenderHtml}</div>`);
    }

    // 7. Robots directive for noindex routes (e.g. 404)
    if (meta.noindex) {
      if (html.includes('<meta name="robots"')) {
        html = html.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, '<meta name="robots" content="noindex, follow">');
      } else {
        html = html.replace('</head>', '  <meta name="robots" content="noindex, follow">\n</head>');
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
