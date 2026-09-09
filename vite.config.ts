import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function sitemapAndPrerenderPlugin(): Plugin {
  return {
    name: 'sitemap-and-prerender-plugin',
    async closeBundle() {
      try {
        const { runPrerender } = await import('./scripts/prerender');
        await runPrerender();
      } catch (e) {
        console.error('Error during post-build prerendering:', e);
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/sitemap.xml') {
          try {
            const { getLiveSitemapXml } = await import('./src/services/sitemapFetcher');
            const xml = await getLiveSitemapXml();
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(xml);
            return;
          } catch (e) {
            console.error('Error serving dynamic dev sitemap:', e);
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sitemapAndPrerenderPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
