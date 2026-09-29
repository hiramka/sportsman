import { useEffect } from 'react';

/**
 * SEOHead Component
 * Dynamically manages document title, meta details, OpenGraph, Twitter Cards,
 * canonical links, and JSON-LD structured data for Search Engines & Social Media.
 */
export default function SEOHead({
  title = "Sportsman.ke - Premium Nairobi Sports E-Commerce & Gear",
  description = "Sportsman.ke is Kenya's premier e-commerce destination for footballs, team jerseys, basketballs, cleats, and table tennis gear with instant M-Pesa checkout and fast Nairobi delivery.",
  keywords = "Sportsman Kenya, Sports gear Nairobi, M-Pesa sports shop, Football boots Kenya, Footballs Nairobi, Basketballs Kenya, Sports jerseys Nairobi, Table tennis Kenya",
  canonical = "https://sportsman.ke",
  ogImage = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80",
  ogType = "website",
  jsonLd = null
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or update meta tag by name or property
    const updateMetaTag = (attrName, attrValue, contentValue) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // 2. Primary SEO Meta Tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('name', 'title', title);

    // 3. OpenGraph (Facebook, WhatsApp, LinkedIn) Meta Tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', canonical || window.location.href);
    updateMetaTag('property', 'og:site_name', 'Sportsman.ke');

    // 4. Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || window.location.href);

    // 6. JSON-LD Dynamic Structured Data
    let scriptLd = document.getElementById('dynamic-jsonld-schema');
    if (jsonLd) {
      if (!scriptLd) {
        scriptLd = document.createElement('script');
        scriptLd.id = 'dynamic-jsonld-schema';
        scriptLd.type = 'application/ld+json';
        document.head.appendChild(scriptLd);
      }
      scriptLd.textContent = JSON.stringify(jsonLd);
    } else if (scriptLd) {
      scriptLd.remove();
    }
  }, [title, description, keywords, canonical, ogImage, ogType, jsonLd]);

  return null;
}
