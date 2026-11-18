import fs from 'fs';
import path from 'path';
import { getLiveSitemapXml } from '../src/services/sitemapFetcher';

export async function generateAndWriteSitemap(): Promise<void> {
  try {
    console.log('[Sitemap] Fetching published posts and generating sitemap.xml...');
    const xml = await getLiveSitemapXml();

    const publicPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xml, 'utf-8');
    console.log(`[Sitemap] Successfully updated ${publicPath} (${xml.length} bytes)`);

    const distDir = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      const distPath = path.resolve(distDir, 'sitemap.xml');
      fs.writeFileSync(distPath, xml, 'utf-8');
      console.log(`[Sitemap] Successfully updated ${distPath} (${xml.length} bytes)`);
    }
  } catch (error) {
    console.error('[Sitemap] Build-time sitemap generation failed due to Firestore error:', error);
    throw error;
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('build-sitemap.ts')) {
  generateAndWriteSitemap()
    .then(() => {
      console.log('[Sitemap] Sitemap build completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Sitemap] FATAL: Build-time sitemap failed:', err);
      process.exit(1);
    });
}
