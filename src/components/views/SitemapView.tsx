import React, { useState, useMemo } from 'react';
import { Post, Category } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Copy, Check, Download, Globe } from 'lucide-react';
import { generateSitemapXml, generateRobotsTxt, DEFAULT_BASE_URL } from '../../utils/sitemapGenerator';

interface Props {
  posts: Post[];
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const SitemapView: React.FC<Props> = ({ posts, categories, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots'>('sitemap');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : DEFAULT_BASE_URL;

  // Generate XML sitemap string using shared utility
  const sitemapXml = useMemo(() => {
    return generateSitemapXml(posts, categories, baseUrl);
  }, [posts, categories, baseUrl]);

  const robotsTxt = useMemo(() => {
    return generateRobotsTxt(baseUrl);
  }, [baseUrl]);

  const currentContent = activeTab === 'sitemap' ? sitemapXml : robotsTxt;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'sitemap' ? 'sitemap.xml' : 'robots.txt';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6 animate-fade-in">
      <Breadcrumbs
        items={[{ label: 'SEO साइटमैप एवं Robots.txt' }]}
        onNavigate={onNavigate}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-700" />
              <span>SEO सर्च इंजन साइटमैप एवं Robots.txt</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Google Search Console, Bing Webmaster एवं क्रॉलर्स हेतु स्वचालित XML व Robots विन्यास
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sitemap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'sitemap' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              sitemap.xml ({posts.filter(p => p.status === 'published').length + categories.length + 5} URLs)
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'robots' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              robots.txt
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="text-slate-600 font-medium">
            प्रारूप: <strong>{activeTab === 'sitemap' ? 'XML Sitemap 0.9' : 'Standard Robots TXT'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold px-3 py-1.5 rounded-md border border-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>डाउनलोड फाइल</span>
            </button>
          </div>
        </div>

        <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[480px] leading-relaxed border border-slate-800">
          <code>{currentContent}</code>
        </pre>
      </div>
    </div>
  );
};
