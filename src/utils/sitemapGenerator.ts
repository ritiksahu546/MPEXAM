import { Post, Category } from '../types';

export const DEFAULT_BASE_URL = 'https://www.mpexamupdates.in';

/**
 * Safely formats any date string or Date object to YYYY-MM-DD for sitemaps.org standard.
 */
export function formatDateToYMD(dateInput?: string): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {}
  if (typeof dateInput === 'string' && dateInput.includes('T')) {
    return dateInput.split('T')[0];
  }
  return typeof dateInput === 'string' && dateInput.length >= 10
    ? dateInput.slice(0, 10)
    : new Date().toISOString().split('T')[0];
}

/**
 * Generates valid Sitemaps.org XML containing all indexable public URLs.
 * Strict rules:
 * 1. Clean path-based URLs only (NO hash '#' symbols)
 * 2. Only published posts (NO drafts/archived/deleted)
 * 3. Exact canonical domain: https://www.mpexamupdates.in/
 * 4. Real lastmod dates from posts/updates
 */
export function generateSitemapXml(
  posts: Post[] = [],
  categories: Category[] = [],
  baseUrl: string = DEFAULT_BASE_URL
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  // Only published posts with valid slugs
  const publishedPosts = posts.filter(p => p.status === 'published' && p.slug);

  // Determine latest post update date for core dynamic listing pages
  let latestGlobalPostDate = today;
  if (publishedPosts.length > 0) {
    const postDates = publishedPosts
      .map(p => formatDateToYMD(p.updatedAt || p.publishedAt || p.createdAt))
      .sort((a, b) => b.localeCompare(a));
    if (postDates.length > 0 && postDates[0]) {
      latestGlobalPostDate = postDates[0];
    }
  }

  const staticPages = [
    { path: '/', lastmod: latestGlobalPostDate || today, changefreq: 'hourly', priority: '1.0' },
    { path: '/jobs', lastmod: latestGlobalPostDate || today, changefreq: 'daily', priority: '0.9' },
    { path: '/admit-cards', lastmod: latestGlobalPostDate || today, changefreq: 'daily', priority: '0.9' },
    { path: '/results', lastmod: latestGlobalPostDate || today, changefreq: 'daily', priority: '0.9' },
    { path: '/answer-keys', lastmod: latestGlobalPostDate || today, changefreq: 'daily', priority: '0.8' },
    { path: '/categories', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { path: '/about', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy-policy', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { path: '/terms-and-conditions', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { path: '/disclaimer', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.4' },
    { path: '/advertisement', lastmod: '2026-03-01', changefreq: 'monthly', priority: '0.5' }
  ];

  const staticUrlsXml = staticPages
    .map(p => {
      const locUrl = p.path === '/' ? `${normalizedBaseUrl}/` : `${normalizedBaseUrl}${p.path}`;
      return `  <url>
    <loc>${locUrl}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`;
    })
    .join('\n');

  const categoryUrlsXml = categories
    .filter(c => c.slug)
    .map(c => {
      const catPosts = publishedPosts.filter(
        p => p.category === c.slug || p.categoryId === c.id || p.categoryName === c.nameEnglish || p.categoryName === c.nameHindi
      );
      let catLastmod = today;
      if (catPosts.length > 0) {
        const catDates = catPosts
          .map(p => formatDateToYMD(p.updatedAt || p.publishedAt || p.createdAt))
          .sort((a, b) => b.localeCompare(a));
        if (catDates[0]) catLastmod = catDates[0];
      }
      return `  <url>
    <loc>${normalizedBaseUrl}/category/${c.slug}</loc>
    <lastmod>${catLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const postUrlsXml = publishedPosts
    .map(p => {
      const cleanDate = formatDateToYMD(p.updatedAt || p.publishedAt || p.createdAt);
      return `  <url>
    <loc>${normalizedBaseUrl}/job/${p.slug}</loc>
    <lastmod>${cleanDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
${staticUrlsXml}

  <!-- Category Pages -->
${categoryUrlsXml}

  <!-- Published Jobs, Admit Cards & Results -->
${postUrlsXml}
</urlset>`.trim();
}

/**
 * Generates standard robots.txt referencing the production sitemap.xml.
 */
export function generateRobotsTxt(baseUrl: string = DEFAULT_BASE_URL): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  return `# robots.txt for MP Exam Update Portal
User-agent: *
Allow: /

# Private admin & auth areas
Disallow: /admin
Disallow: /reset-password

# Google & Bing Crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${normalizedBaseUrl}/sitemap.xml
`.trim();
}
