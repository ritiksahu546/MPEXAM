import React, { useEffect } from 'react';

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
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItemSchema[];
  jobPosting?: {
    title: string;
    description: string;
    datePosted: string;
    validThrough?: string;
    organization: string;
    officialWebsite?: string;
    salary?: string;
    employmentType?: string;
  };
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description = 'मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB (व्यापम), पुलिस भर्ती, एडमिट कार्ड, रिजल्ट और परीक्षा अपडेट का सबसे विश्वसनीय पोर्टल।',
  keywords = 'MP Jobs 2026, MPPSC, MPESB, MP Police, Sarkari Result MP, एडमिट कार्ड, परीक्षा परिणाम',
  canonicalUrl,
  ogType = 'website',
  ogImage = 'https://www.mpexamupdates.in/og-banner.svg',
  publishedTime,
  modifiedTime,
  breadcrumbs,
  faqs,
  jobPosting
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('MP Exam Update') ? title : `${title} | MP Exam Update 2026`;
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

    // 2. Standard Metadata
    setMeta('name', 'description', description);
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 3. Canonical URL (Never contain hash)
    const rawUrl = canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://www.mpexamupdates.in');
    const currentUrl = rawUrl.split('#')[0];
    setLink('canonical', currentUrl);

    // 4. Open Graph Tags
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:site_name', 'MP Exam Update');
    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
    }
    if (publishedTime) {
      setMeta('property', 'article:published_time', publishedTime);
    }
    if (modifiedTime) {
      setMeta('property', 'article:modified_time', modifiedTime);
    }

    // 5. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', description);
    if (ogImage) {
      setMeta('name', 'twitter:image', ogImage);
    }

    // 6. JSON-LD Structured Data
    const schemas: any[] = [];

    // Base WebSite schema on homepage
    if (ogType === 'website') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'MP Exam Update',
        url: 'https://www.mpexamupdates.in',
        description: 'मध्य प्रदेश सरकारी नौकरी, MPPSC, MPESB, एडमिट कार्ड, रिजल्ट और परीक्षा पोर्टल',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.mpexamupdates.in/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      });
    }

    // Article schema for detailed posts
    if (ogType === 'article') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description: description,
        image: ogImage ? [ogImage] : undefined,
        datePublished: publishedTime || new Date().toISOString(),
        dateModified: modifiedTime || publishedTime || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: 'MP Exam Update editorial team',
          url: 'https://www.mpexamupdates.in'
        },
        publisher: {
          '@type': 'Organization',
          name: 'MP Exam Update',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.mpexamupdates.in/logo.png'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': currentUrl
        }
      });
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
          item: b.item
        }))
      });
    }

    // FAQ schema
    if (faqs && faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer
          }
        }))
      });
    }

    // JobPosting schema ONLY if valid data exists and post represents a job
    if (jobPosting && jobPosting.title && jobPosting.organization) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: jobPosting.title,
        description: jobPosting.description,
        datePosted: jobPosting.datePosted,
        validThrough: jobPosting.validThrough || '2026-12-31',
        employmentType: jobPosting.employmentType || 'FULL_TIME',
        hiringOrganization: {
          '@type': 'Organization',
          name: jobPosting.organization,
          sameAs: jobPosting.officialWebsite || 'https://mp.gov.in'
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressRegion: 'Madhya Pradesh',
            addressCountry: 'IN'
          }
        },
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'INR',
          value: {
            '@type': 'QuantitativeValue',
            value: jobPosting.salary || 'Competitive Government Pay Scale'
          }
        }
      });
    }

    // Inject Script element
    let scriptTag = document.getElementById('seo-json-ld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);

    return () => {
      // Clean up script on unmount
      const existing = document.getElementById('seo-json-ld');
      if (existing) {
        existing.remove();
      }
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage, publishedTime, modifiedTime, breadcrumbs, faqs, jobPosting]);

  return null;
};
