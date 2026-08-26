export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.datum.net/#organization',
  name: 'Datum',
  legalName: 'Datum Technology, Inc.',
  url: 'https://www.datum.net',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.datum.net/datum-light.svg',
  },
  description:
    'Datum is an open, neutral, global network cloud that is built for AI and focused on giving alternative cloud providers critical network infrastructure to compete at scale, no networking team required!',
  foundingDate: '2024',
  founder: [
    {
      '@type': 'Person',
      '@id': 'https://www.datum.net/about/#zac-smith',
      name: 'Zac Smith',
    },
    {
      '@type': 'Person',
      '@id': 'https://www.datum.net/about/#jacob-smith',
      name: 'Jacob Smith',
    },
  ],
  sameAs: [
    'https://github.com/datum-cloud',
    'https://www.youtube.com/@Datum-Cloud',
    'https://www.linkedin.com/company/datum-cloud',
    'https://twitter.com/datumcloud',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: 'https://www.datum.net/contact/',
    email: 'support@datum.net',
    availableLanguage: 'English',
  },
  // Matches the "General inquiries" address published in the Privacy
  // Policy's "How to contact us" section (src/content/legal/privacy.mdx) —
  // NOT the address in the Data Processing Agreement's Processor row
  // ("120 Broadway, 26th Floor... 10271"), which disagrees with this one
  // and looks like stale/inconsistent legal content. Flagged for a human to
  // reconcile; this file shouldn't guess which one is authoritative.
  address: {
    '@type': 'PostalAddress',
    streetAddress: '29 Broadway, 31st Floor',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10006',
    addressCountry: 'US',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Datum Cloud',
    description:
      'Global network cloud platform for AI workloads — AI Edge, QUIC Connectors, DNS, Domains, VPC, and Kubernetes-native control plane.',
  },
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.datum.net/#website',
  url: 'https://www.datum.net',
  name: 'Datum',
  description: 'Open source network cloud for AI',
  publisher: {
    '@id': 'https://www.datum.net/#organization',
  },
};
