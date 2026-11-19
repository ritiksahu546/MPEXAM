import { Post, Category } from '../types';

export const DEFAULT_BASE_URL = 'https://mpexamupdates.in';

/**
 * Normalizes any URL or path to the strict non-www canonical production domain:
 * https://mpexamupdates.in
 */
export function normalizeCanonicalUrl(rawUrl?: string | null, baseUrl: string = DEFAULT_BASE_URL): string {
  const cleanBase = baseUrl.replace(/^https?:\/\/(www\.)?mpexamupdates\.in/i, 'https://mpexamupdates.in').replace(/\/+$/, '');
  if (!rawUrl) return `${cleanBase}/`;

  let cleaned = String(rawUrl).trim();
  // Strip hash and query parameters
  cleaned = cleaned.split('#')[0].split('?')[0].trim();

  // Force https://mpexamupdates.in (non-www)
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?mpexamupdates\.in/i, 'https://mpexamupdates.in');

  // If relative path, prepend cleanBase
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    const rel = cleaned.replace(/^\/+/, '');
    cleaned = rel ? `${cleanBase}/${rel}` : `${cleanBase}/`;
  }

  // Normalize legacy category paths
  cleaned = cleaned.replace(/\/category\/central-government-jobs(\/|$)/i, '/category/central-jobs');
  cleaned = cleaned.replace(/\/category\/scheme(\/|$)/i, '/category/sarkari-yojana');
  cleaned = cleaned.replace(/\/category\/govt-schemes(\/|$)/i, '/category/sarkari-yojana');
  cleaned = cleaned.replace(/\/category\/mp-govt-jobs(\/|$)/i, '/category/sarkari-naukri');

  // Keep trailing slash ONLY for root domain
  if (/^https?:\/\/[^/]+\/?$/i.test(cleaned)) {
    return `${cleaned.replace(/\/+$/, '')}/`;
  }

  return cleaned.replace(/\/+$/, '');
}

/**
 * Escapes XML special characters for safe inclusion in XML elements.
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Safely formats any valid date string or Date object to YYYY-MM-DD for sitemaps.org standard.
 * Returns undefined if date is missing, empty, or invalid.
 * Strictly avoids fallback to today's date so search engines are not fed false modification times.
 */
export function formatDateToYMD(dateInput?: string | null): string | undefined {
  if (!dateInput) return undefined;
  const trimmed = String(dateInput).trim();
  if (!trimmed) return undefined;

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const year = parseInt(trimmed.slice(0, 4), 10);
    if (year >= 2000 && year <= 2099) return trimmed;
  }

  // If ISO 8601 string starting with YYYY-MM-DD (e.g. 2026-09-09T14:32:00.000Z)
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const ymd = trimmed.slice(0, 10);
    const year = parseInt(ymd.slice(0, 4), 10);
    if (year >= 2000 && year <= 2099) return ymd;
  }

  // If DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = parseInt(dmyMatch[3], 10);
    if (year >= 2000 && year <= 2099) {
      return `${year}-${month}-${day}`;
    }
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear();
      if (year >= 2000 && year <= 2099) {
        return d.toISOString().split('T')[0];
      }
    }
  } catch {}

  return undefined;
}

/**
 * Normalizes a category slug to its canonical form.
 * Maps legacy or internal IDs ("central-government-jobs", "scheme", "govt-schemes", "mp-govt-jobs")
 * to their canonical public slugs.
 */
export function normalizeCategorySlug(rawSlug?: string | null): string {
  if (!rawSlug) return '';
  const trimmed = String(rawSlug)
    .trim()
    .toLowerCase()
    .replace(/^#\/?/, '')
    .replace(/^category\//, '')
    .replace(/^\/+|\/+$/g, '');

  if (trimmed === 'central-government-jobs') return 'central-jobs';
  if (trimmed === 'scheme' || trimmed === 'govt-schemes') return 'sarkari-yojana';
  if (trimmed === 'mp-govt-jobs') return 'sarkari-naukri';
  return trimmed;
}

/**
 * Normalizes a post slug to clean path format.
 */
export function normalizePostSlug(rawSlug?: string | null): string {
  if (!rawSlug) return '';
  return String(rawSlug)
    .trim()
    .replace(/^#\/?/, '')
    .replace(/^(job|post)\//, '')
    .replace(/^\/+|\/+$/g, '');
}

/**
 * Determines whether a post belongs to a category by checking categoryId, slug, name,
 * postType, and department keywords consistently across client UI, prerendering, and sitemap.
 */
export function doesPostMatchCategory(post: Post, cat?: Category | null, rawTargetSlug?: string): boolean {
  const canonicalTarget = normalizeCategorySlug(rawTargetSlug || cat?.slug || cat?.id);
  if (!canonicalTarget) return true;

  const postCatSlug = normalizeCategorySlug(post.category || post.categoryId);
  const postCatIdSlug = normalizeCategorySlug(post.categoryId);

  if (postCatSlug === canonicalTarget || postCatIdSlug === canonicalTarget) {
    return true;
  }

  if (cat) {
    if (post.categoryId === cat.id || post.category === cat.id) return true;
    if (cat.nameEnglish && (post.categoryName?.toLowerCase() === cat.nameEnglish.toLowerCase() || post.category?.toLowerCase() === cat.nameEnglish.toLowerCase())) {
      return true;
    }
    if (cat.nameHindi && (post.categoryName === cat.nameHindi || post.category === cat.nameHindi)) {
      return true;
    }
  }

  // Match vertical category hubs with their corresponding postTypes and keywords
  const combinedText = `${post.slug || ''} ${post.title || ''} ${post.titleHindi || ''} ${post.organization || ''} ${post.categoryName || ''} ${(post.tags || []).join(' ')}`.toLowerCase();

  switch (canonicalTarget) {
    case 'admit-card':
      return post.postType === 'admit_card' || Boolean(post.admitCardLink) || combinedText.includes('admit card') || combinedText.includes('प्रवेश पत्र');
    case 'results':
      return post.postType === 'result' || Boolean(post.resultLink) || combinedText.includes('result') || combinedText.includes('परिणाम');
    case 'answer-key':
      return post.postType === 'answer_key' || Boolean(post.answerKeyLink) || combinedText.includes('answer key') || combinedText.includes('उत्तर कुंजी');
    case 'syllabus':
      return post.postType === 'syllabus' || Boolean(post.syllabus) || Boolean(post.examPattern);
    case 'previous-papers':
      return post.postType === 'previous_paper' || combinedText.includes('previous paper') || combinedText.includes('प्रश्न पत्र');
    case 'sarkari-yojana':
      return post.postType === 'scheme' || combinedText.includes('yojana') || combinedText.includes('योजना');
    case 'sarkari-naukri':
      return post.postType === 'job';
    case 'exam-calendar':
      return Boolean(post.examDate || post.applicationLastDate);
    case 'mp-police':
      return combinedText.includes('police') || combinedText.includes('पुलिस') || combinedText.includes('subedar') || combinedText.includes('constable');
    case 'mppsc':
      return combinedText.includes('mppsc') || combinedText.includes('लोक सेवा आयोग');
    case 'mpesb':
      return combinedText.includes('mpesb') || combinedText.includes('vyapam') || combinedText.includes('व्यापम') || combinedText.includes('कर्मचारी चयन मंडल');
    case 'teacher-jobs':
      return combinedText.includes('teacher') || combinedText.includes('शिक्षक') || combinedText.includes('tet') || combinedText.includes('वर्ग');
    case 'patwari':
      return combinedText.includes('patwari') || combinedText.includes('पटवारी') || combinedText.includes('राजस्व');
    case 'panchayat':
      return combinedText.includes('panchayat') || combinedText.includes('पंचायत') || combinedText.includes('ग्रामीण');
    case 'central-jobs':
      return combinedText.includes('ssc') || combinedText.includes('upsc') || combinedText.includes('railway') || combinedText.includes('central') || combinedText.includes('केंद्र');
    default:
      return false;
  }
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * Generates valid Sitemaps.org XML containing all indexable public URLs.
 * Strict rules:
 * 1. Clean path-based URLs only (NO hash '#' symbols)
 * 2. Only published posts (NO drafts/archived/deleted)
 * 3. Exact canonical non-www domain: https://mpexamupdates.in
 * 4. Real lastmod dates from posts/updates (omitted if unknown; NO fake today's date)
 * 5. Deduplicates categories by canonical slug and maps "central-government-jobs" -> "central-jobs"
 * 6. Guarantees no duplicate <loc> entries
 * 7. XML safety escaping on all values
 */
export function generateSitemapXml(
  posts: Post[] = [],
  categories: Category[] = [],
  baseUrl: string = DEFAULT_BASE_URL
): string {
  const normalizedBaseUrl = baseUrl
    .replace(/^https?:\/\/(www\.)?mpexamupdates\.in/i, 'https://mpexamupdates.in')
    .replace(/\/+$/, '');

  // 1. Filter only published posts with a valid slug
  const publishedPosts = posts.filter(
    p => p.status === 'published' && p.slug && typeof p.slug === 'string' && p.slug.trim().length > 0
  );

  // Determine latest post update date for dynamic listing pages (ONLY if real dates exist)
  let latestGlobalPostDate: string | undefined = undefined;
  if (publishedPosts.length > 0) {
    const postDates = publishedPosts
      .map(p => formatDateToYMD(p.updatedAt || p.publishedAt || p.createdAt))
      .filter((d): d is string => Boolean(d))
      .sort((a, b) => b.localeCompare(a));
    if (postDates.length > 0) {
      latestGlobalPostDate = postDates[0];
    }
  }

  // Registry to prevent ANY duplicate <loc> entries
  const seenUrls = new Set<string>();
  const urlEntries: SitemapUrlEntry[] = [];

  const addUrlEntry = (entry: SitemapUrlEntry) => {
    if (!entry.loc || typeof entry.loc !== 'string') return;
    const cleanUrl = normalizeCanonicalUrl(entry.loc, normalizedBaseUrl);

    // Strict safety filters
    if (!cleanUrl.startsWith(normalizedBaseUrl)) return;
    if (cleanUrl.includes('#') || cleanUrl.includes('?')) return;
    if (cleanUrl.includes('/admin')) return;
    if (cleanUrl.includes('/reset-password')) return;
    if (cleanUrl.includes('/search')) return;
    if (cleanUrl.includes('/saved-jobs')) return;
    if (cleanUrl.includes('/404')) return;

    if (seenUrls.has(cleanUrl)) return;
    seenUrls.add(cleanUrl);

    urlEntries.push({
      loc: cleanUrl,
      lastmod: formatDateToYMD(entry.lastmod),
      changefreq: entry.changefreq,
      priority: entry.priority
    });
  };

  // 2. Core Static & Hub Pages
  const staticPages: SitemapUrlEntry[] = [
    { loc: `${normalizedBaseUrl}/`, lastmod: latestGlobalPostDate, changefreq: 'hourly', priority: '1.0' },
    { loc: `${normalizedBaseUrl}/jobs`, lastmod: latestGlobalPostDate, changefreq: 'daily', priority: '0.9' },
    { loc: `${normalizedBaseUrl}/admit-cards`, lastmod: latestGlobalPostDate, changefreq: 'daily', priority: '0.9' },
    { loc: `${normalizedBaseUrl}/results`, lastmod: latestGlobalPostDate, changefreq: 'daily', priority: '0.9' },
    { loc: `${normalizedBaseUrl}/answer-keys`, lastmod: latestGlobalPostDate, changefreq: 'daily', priority: '0.8' },
    { loc: `${normalizedBaseUrl}/categories`, lastmod: latestGlobalPostDate, changefreq: 'weekly', priority: '0.8' },
    { loc: `${normalizedBaseUrl}/about`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.6' },
    { loc: `${normalizedBaseUrl}/contact`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.6' },
    { loc: `${normalizedBaseUrl}/privacy-policy`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { loc: `${normalizedBaseUrl}/terms-and-conditions`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { loc: `${normalizedBaseUrl}/disclaimer`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { loc: `${normalizedBaseUrl}/advertisement`, lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.5' }
  ];

  for (const page of staticPages) {
    addUrlEntry(page);
  }

  // 3. Category Pages - Deduplicated by canonical slug
  const canonicalCategoriesMap = new Map<string, { category: Category; posts: Post[] }>();

  for (const cat of categories) {
    if (!cat || !cat.slug || (cat as Category & { active?: boolean }).active === false) continue;
    const canonicalSlug = normalizeCategorySlug(cat.slug);
    if (!canonicalSlug) continue;

    const catPosts = publishedPosts.filter(p => doesPostMatchCategory(p, cat, canonicalSlug));

    if (!canonicalCategoriesMap.has(canonicalSlug)) {
      canonicalCategoriesMap.set(canonicalSlug, {
        category: { ...cat, slug: canonicalSlug },
        posts: catPosts
      });
    } else {
      const existing = canonicalCategoriesMap.get(canonicalSlug)!;
      for (const p of catPosts) {
        if (!existing.posts.some(ep => ep.id === p.id)) {
          existing.posts.push(p);
        }
      }
    }
  }

  // Sort canonical categories consistently
  const sortedCanonicalEntries = Array.from(canonicalCategoriesMap.entries()).sort(
    ([slugA, a], [slugB, b]) => (a.category.order || 0) - (b.category.order || 0) || slugA.localeCompare(slugB)
  );

  for (const [canonicalSlug, data] of sortedCanonicalEntries) {
    let catLastmod: string | undefined = undefined;
    if (data.posts.length > 0) {
      const catDates = data.posts
        .map(p => formatDateToYMD(p.updatedAt || p.publishedAt || p.createdAt))
        .filter((d): d is string => Boolean(d))
        .sort((a, b) => b.localeCompare(a));
      if (catDates.length > 0) {
        catLastmod = catDates[0];
      }
    }

    addUrlEntry({
      loc: `${normalizedBaseUrl}/category/${canonicalSlug}`,
      lastmod: catLastmod,
      changefreq: 'daily',
      priority: '0.8'
    });
  }

  // 4. Published Job/Post Detail Pages
  for (const post of publishedPosts) {
    const cleanSlug = normalizePostSlug(post.slug);
    if (!cleanSlug) continue;

    const postDate = formatDateToYMD(post.updatedAt || post.publishedAt || post.createdAt);

    addUrlEntry({
      loc: `${normalizedBaseUrl}/job/${cleanSlug}`,
      lastmod: postDate,
      changefreq: 'weekly',
      priority: '0.9'
    });
  }

  // 5. Build XML with XML safety escaping
  const xmlUrls = urlEntries
    .map(entry => {
      const escapedLoc = escapeXml(entry.loc);
      const lines = [
        '  <url>',
        `    <loc>${escapedLoc}</loc>`
      ];
      if (entry.lastmod) {
        lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      if (entry.changefreq) {
        lines.push(`    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`);
      }
      if (entry.priority) {
        lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      }
      lines.push('  </url>');
      return lines.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`.trim();
}

/**
 * Generates standard robots.txt referencing the production non-www sitemap.xml.
 */
export function generateRobotsTxt(baseUrl: string = DEFAULT_BASE_URL): string {
  const normalizedBaseUrl = baseUrl
    .replace(/^https?:\/\/(www\.)?mpexamupdates\.in/i, 'https://mpexamupdates.in')
    .replace(/\/+$/, '');
  return `User-agent: *
Allow: /

# Private admin, auth & user-specific routes
Disallow: /admin
Disallow: /reset-password
Disallow: /search
Disallow: /saved-jobs

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${normalizedBaseUrl}/sitemap.xml
`.trim();
}
