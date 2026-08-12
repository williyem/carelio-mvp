export const seoConfig = {
  // Basic site information
  siteName: 'Carelio',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://carelio.app',
  defaultTitle: 'Carelio',
  titleTemplate: '%s | Carelio',

  // Main description
  description:
    'Carelio — Smart Appointments. Better Care. A unified healthcare platform for scheduling, telehealth consultations, and patient management.',

  // Keywords for SEO
  keywords: [
    'healthcare',
    'telemedicine',
    'digital health',
    'HIPAA compliant',
    'patient care',
    'healthcare technology',
    'medical consultation',
    'telehealth',
    'behavioral health',
    'mental health services',
    'clinical psychology',
    'therapy services',
    'counseling',
    'wellness programs',
    'healthcare innovation',
    'digital medical platform',
    'remote healthcare',
    'telehealth services',
    'smart appointments',
    'carelio',
  ],

  // Author and publisher information
  author: 'Carelio',
  creator: 'Carelio',
  publisher: 'Carelio',

  // Social media handles
  twitterHandle: '@carelio',

  // Theme colors
  themeColor: '#4DA2FF',
  backgroundColor: '#ffffff',

  // Image assets
  images: {
    logo: '/android-chrome-512x512.png',
    logoAlt: 'Carelio Logo',
    logoWidth: 512,
    logoHeight: 512,
    ogImage: '/og-logo-large.png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: 'Carelio',
  },

  // Favicon configuration
  favicons: {
    icon16: '/favicon-96x96.png',
    icon32: '/favicon-96x96.png',
    shortcut: '/favicon.ico',
    appleTouch: '/apple-touch-icon.png',
    appleTouchSize: '180x180',
  },

  // Web manifest
  manifest: '/site.webmanifest',

  // Category for content classification
  category: 'healthcare',

  // Locale settings
  locale: 'en_US',

  // Format detection settings
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Robots configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  } as const,

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://carelio.app',
    title: 'Carelio',
    description:
      'Smart Appointments. Better Care. A unified healthcare platform for clinicians and patients.',
    siteName: 'Carelio',
  },

  // Twitter Card configuration
  twitter: {
    card: 'summary_large_image',
    title: 'Carelio',
    description:
      'Smart Appointments. Better Care. A unified healthcare platform for clinicians and patients.',
    creator: '@carelio',
  },

  // Additional SEO settings
  additional: {
    canonical: '/',
    category: 'healthcare',
  },
};

export const generatePageMetadata = (
  pageTitle?: string,
  pageDescription?: string,
  pageImage?: string
) => {
  const title = pageTitle ? `${pageTitle} | Carelio` : seoConfig.defaultTitle;
  const description = pageDescription || seoConfig.description;

  // Handle image URLs - convert relative to absolute if needed
  let imageUrl = pageImage || seoConfig.images.ogImage;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${seoConfig.siteUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  } else if (!imageUrl) {
    imageUrl = `${seoConfig.siteUrl}${seoConfig.images.ogImage}`;
  }

  return {
    title,
    description,
    openGraph: {
      ...seoConfig.openGraph,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: seoConfig.images.ogImageWidth,
          height: seoConfig.images.ogImageHeight,
          alt: seoConfig.images.ogImageAlt,
        },
      ],
    },
    twitter: {
      ...seoConfig.twitter,
      title,
      description,
      images: [imageUrl],
    },
  };
};

// Export individual sections for easy access
export const {
  siteName,
  siteUrl,
  defaultTitle,
  titleTemplate,
  description,
  keywords,
  author,
  creator,
  publisher,
  twitterHandle,
  themeColor,
  backgroundColor,
  images,
  favicons,
  manifest,
  category,
  locale,
  formatDetection,
  robots,
  openGraph,
  twitter,
  additional,
} = seoConfig;
