import React, { useEffect } from 'react';
import { DEFAULT_BASE_URL, normalizeCanonicalUrl } from '../../utils/sitemapGenerator';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItemSchema {
  question: string;
  answer: string;
}

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItemSchema[];
  jobPosting?: {
    title: string;
    description?: string;
    datePosted?: string;
    validThrough?: string;
    organization: string;
    officialWebsite?: string;
    location?: string;
    salary?: string;
    employmentType?: string;
  };
}

export function parseIsoDateOnly(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    if (year >= 2000 && year <= 2099) {
      return parsed.toISOString().split('T')[0];
    }
  }
  return undefined;
}

export function parseIsoDateTime(input?: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim();
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    if (year >= 2000 && year <= 2099) {
      return parsed.toISOString();
    }
  }
  const dateOnly = parseIsoDateOnly(trimmed);
  if (dateOnly) {
    return `${dateOnly}T00:00:00.000Z`;
  }
  return undefined;
}

export function isJobDateExpired(dateInput?: string): boolean {
  const isoDate = parseIsoDateOnly(dateInput);
  if (!isoDate) return false;
  const expiryTime = new Date(`${isoDate}T23:59:59.999Z`).getTime();
  if (isNaN(expiryTime)) return false;
  return expiryTime < Date.now();
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description = 'मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB (व्यापम), पुलिस भर्ती, एडमिट कार्ड, रिजल्ट और परीक्षा अपडेट का सबसे विश्वसनीय पोर्टल।',
  keywords = 'MP Jobs 2026, MPPSC, MPESB, MP Police, Sarkari Result MP, एडमिट कार्ड, परीक्षा परिणाम',
  canonicalUrl,
  noindex = false,
  ogType = 'website',
  ogImage = `${DEFAULT_BASE_URL}/og-banner.svg`,
  publishedTime,
  modifiedTime,
  breadcrumbs,
  faqs,
  jobPosting
}) => {
  useEffect(() => {
    // 1. Update Title
    let formattedTitle = title.trim();
    if (!formattedTitle.includes('MP Exam Update')) {
      formattedTitle = `${formattedTitle} | MP Exam Update`;
    }
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMeta = (attribute: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set or create link tag
    const setLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Robots directive
    if (noindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 3. Standard Metadata
    setMeta('name', 'description', description);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 4. Canonical URL (Always normalize to https://mpexamupdates.in non-www, no hash/query)
    const fallbackPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const currentUrl = normalizeCanonicalUrl(canonicalUrl || `${DEFAULT_BASE_URL}${fallbackPath}`);
    setLink('canonical', currentUrl);

    const normalizedOgImage = (ogImage || `${DEFAULT_BASE_URL}/og-banner.svg`).replace(
      /^https?:\/\/(www\.)?mpexamupdates\.in/i,
      DEFAULT_BASE_URL
    );

    // 5. Open Graph Tags
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:site_name', 'MP Exam Update');
    setMeta('property', 'og:image', normalizedOgImage);

    if (publishedTime) {
      const isoPub = parseIsoDateTime(publishedTime);
      if (isoPub) setMeta('property', 'article:published_time', isoPub);
    }
    if (modifiedTime) {
      const isoMod = parseIsoDateTime(modifiedTime);
      if (isoMod) setMeta('property', 'article:modified_time', isoMod);
    }

    // 6. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', normalizedOgImage);

    // 7. JSON-LD Structured Data
    const schemas: any[] = [];

    // Base WebSite & Organization schema on website pages
    if (ogType === 'website') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${DEFAULT_BASE_URL}/#website`,
        name: 'MP Exam Update',
        url: `${DEFAULT_BASE_URL}/`,
        description: 'मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB, एडमिट कार्ड, रिजल्ट और परीक्षा पोर्टल',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${DEFAULT_BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${DEFAULT_BASE_URL}/#organization`,
        name: 'MP Exam Update',
        url: `${DEFAULT_BASE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${DEFAULT_BASE_URL}/favicon.svg`
        }
      });
    }

    // Article schema for detailed posts
    if (ogType === 'article') {
      const articleSchema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        url: currentUrl,
        author: {
          '@type': 'Organization',
          name: 'MP Exam Update Editorial Team',
          url: `${DEFAULT_BASE_URL}/about`
        },
        publisher: {
          '@type': 'Organization',
          name: 'MP Exam Update',
          url: `${DEFAULT_BASE_URL}/`,
          logo: {
            '@type': 'ImageObject',
            url: `${DEFAULT_BASE_URL}/og-banner.svg`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl
        }
      };

      if (normalizedOgImage) {
        articleSchema.image = [normalizedOgImage];
      }

      const isoPublished = parseIsoDateTime(publishedTime);
      if (isoPublished) {
        articleSchema.datePublished = isoPublished;
      }

      const isoModified = parseIsoDateTime(modifiedTime) || isoPublished;
      if (isoModified) {
        articleSchema.dateModified = isoModified;
      }

      schemas.push(articleSchema);
    }

    // Breadcrumbs schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: normalizeCanonicalUrl(b.item)
        }))
      });
    }

    // FAQ schema (only for genuine visible FAQs)
    if (faqs && faqs.length > 0) {
      const validFaqs = faqs.filter(f => f.question?.trim() && f.answer?.trim());
      if (validFaqs.length > 0) {
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: validFaqs.map(f => ({
            '@type': 'Question',
            name: f.question.trim(),
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer.trim()
            }
          }))
        });
      }
    }

    // JobPosting schema ONLY if genuine active job and not expired
    if (jobPosting && jobPosting.title && jobPosting.organization && !isJobDateExpired(jobPosting.validThrough)) {
      const jobSchema: Record<string, any> = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: jobPosting.title,
        description: jobPosting.description || description,
        hiringOrganization: {
          '@type': 'Organization',
          name: jobPosting.organization
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: jobPosting.location || 'Madhya Pradesh',
            addressCountry: 'IN'
          }
        }
      };

      if (
        jobPosting.officialWebsite &&
        jobPosting.officialWebsite.startsWith('http') &&
        !jobPosting.officialWebsite.includes('mpexamupdates.in')
      ) {
        jobSchema.hiringOrganization.sameAs = jobPosting.officialWebsite;
      }

      const posted = parseIsoDateOnly(jobPosting.datePosted);
      if (posted) {
        jobSchema.datePosted = posted;
      }

      const validThrough = parseIsoDateOnly(jobPosting.validThrough);
      if (validThrough) {
        jobSchema.validThrough = validThrough;
      }

      if (jobPosting.employmentType) {
        jobSchema.employmentType = jobPosting.employmentType;
      }

      schemas.push(jobSchema);
    }

    // Update or create the single #seo-json-ld script element
    let scriptTag = document.getElementById('seo-json-ld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  }, [title, description, keywords, canonicalUrl, noindex, ogType, ogImage, publishedTime, modifiedTime, breadcrumbs, faqs, jobPosting]);

  return null;
};
