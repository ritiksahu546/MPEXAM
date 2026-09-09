import DOMPurify from 'dompurify';

/**
 * Trusted domains for third-party ad scripts.
 */
const TRUSTED_AD_DOMAINS = [
  'pagead2.googlesyndication.com',
  'adservice.google.com',
  'partner.googleadservices.com',
  'googleads.g.doubleclick.net',
  'www.googletagservices.com'
];

/**
 * Dangerous Javascript identifiers/patterns that should never appear in ad slots.
 */
const DANGEROUS_PATTERNS = [
  /document\.cookie/i,
  /localStorage/i,
  /sessionStorage/i,
  /indexedDB/i,
  /\beval\s*\(/i,
  /\bFunction\s*\(/i,
  /\bfetch\s*\(/i,
  /\bXMLHttpRequest\b/i,
  /window\.location/i,
  /document\.location/i,
  /<meta/i,
  /<base/i
];

/**
 * Hardened sanitizer for ad HTML snippets (Google AdSense, banners, affiliate codes).
 * Allows official Google AdSense snippets while blocking XSS vulnerabilities and malicious payloads.
 */
export function sanitizeAdCode(rawCode?: string | null): string {
  if (!rawCode || typeof rawCode !== 'string') {
    return '';
  }

  const trimmed = rawCode.trim();
  if (!trimmed) {
    return '';
  }

  try {
    // 1. Initial sanitization allowing standard ad tags and data attributes
    const cleanHtml = DOMPurify.sanitize(trimmed, {
      ADD_TAGS: ['ins', 'script', 'iframe', 'picture', 'source'],
      ADD_ATTR: [
        'async',
        'crossorigin',
        'target',
        'rel',
        'data-ad-client',
        'data-ad-slot',
        'data-ad-format',
        'data-full-width-responsive',
        'data-ad-layout',
        'data-ad-layout-key',
        'aria-hidden'
      ],
      FORCE_BODY: false
    });

    if (!cleanHtml) {
      return '';
    }

    // 2. Extra verification for script tags to ensure only trusted ad scripts run
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${cleanHtml}</div>`, 'text/html');
      const scripts = doc.querySelectorAll('script');

      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const src = script.getAttribute('src');

        if (src) {
          try {
            const parsedUrl = new URL(src, window.location.origin);
            const isTrustedHost = TRUSTED_AD_DOMAINS.some(domain =>
              parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
            );
            if (!isTrustedHost) {
              // Untrusted external script: remove it
              script.remove();
            }
          } catch {
            // Malformed script URL: remove it
            script.remove();
          }
        } else {
          // Inline script (e.g. adsbygoogle push)
          const inlineContent = script.textContent || '';
          const hasDanger = DANGEROUS_PATTERNS.some(pattern => pattern.test(inlineContent));
          if (hasDanger) {
            script.remove();
          }
        }
      }

      return doc.body.firstElementChild?.innerHTML || '';
    }

    return cleanHtml;
  } catch (err) {
    console.error('Failed to sanitize ad code:', err);
    return '';
  }
}
