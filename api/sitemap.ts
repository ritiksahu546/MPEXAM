import { getLiveSitemapXml } from '../src/services/sitemapFetcher';

/**
 * Serverless handler for /sitemap.xml (Vercel / Cloud Run compatible).
 * Dynamically queries Firestore for all currently published posts and streams the XML response.
 */
export default async function handler(req: any, res: any) {
  try {
    const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
    const protocol = req.headers?.['x-forwarded-proto'] || 'https';
    const baseUrl = host ? `${protocol}://${host}` : undefined;

    const xml = await getLiveSitemapXml(baseUrl);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache for 30 minutes on CDN, allow revalidation
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return res.status(500).send('<!-- Internal error generating dynamic sitemap -->');
  }
}
