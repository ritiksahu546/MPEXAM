import { Post, Category } from '../types';

export const DEFAULT_BASE_URL = 'https://mpexamupdate.in';

/**
 * Generates valid Sitemaps.org XML containing all indexable public URLs.
 * Strict rules:
 * 1. Clean path-based URLs only (NO hash '#' symbols)
 * 2. Only published posts (NO drafts/archived/deleted)
 * 3. Includes core pages, category hubs, and job postings
 */
export function generateSitemapXml(
  posts: Post[] = [],
  categories: Category[] = [],
  baseUrl: string = DEFAULT_BASE_URL
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const staticPages = [
    { path: '', changefreq: 'hourly', priority: '1.0' },
    { path: '/jobs', changefreq: 'daily', priority: '0.9' },
    { path: '/admit-cards', changefreq: 'daily', priority: '0.9' },
    { path: '/results', changefreq: 'daily', priority: '0.9' },
    { path: '/answer-keys', changefreq: 'daily', priority: '0.8' },
    { path: '/categories', changefreq: 'weekly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/terms-and-conditions', changefreq: 'monthly', priority: '0.4' },
    { path: '/disclaimer', changefreq: 'monthly', priority: '0.4' },
    { path: '/advertisement', changefreq: 'monthly', priority: '0.5' }
  ];

  const staticUrlsXml = staticPages
    .map(
      p => `  <url>
    <loc>${normalizedBaseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const categoryUrlsXml = categories
    .filter(c => c.slug)
    .map(
      c => `  <url>
    <loc>${normalizedBaseUrl}/category/${c.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  // Only published posts with valid slugs
  const publishedPosts = posts.filter(p => p.status === 'published' && p.slug);
  const postUrlsXml = publishedPosts
    .map(p => {
      const lastModDate = p.updatedAt || p.createdAt || today;
      const cleanDate = lastModDate.split('T')[0] || today;
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
