import { getLiveSitemapXml } from '../src/services/sitemapFetcher';
import { DEFAULT_BASE_URL } from '../src/utils/sitemapGenerator';

/**
 * Serverless handler for /sitemap.xml (Vercel / Cloud Run compatible).
 * Dynamically queries Firestore for all currently published posts and streams the XML response.
 */
export default async function handler(_req: any, res: any) {
  try {
    const xml = await getLiveSitemapXml(DEFAULT_BASE_URL);

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache for 30 minutes on CDN, allow revalidation
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('[API /sitemap.xml] Server error: Firestore failed to generate live sitemap:', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send(
      `500 Internal Server Error: Failed to generate live sitemap from Firestore database. ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
