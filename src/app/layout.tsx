import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from '@/lib/providers';
import { seoConfig } from '@/lib/seo';

const eudoxusSans = localFont({
  src: [
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Regular-BF659b6cb1d4714.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Medium-BF659b6cb1c14cb.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Bold-BF659b6cb1408e5.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/eudoxus-sans/EudoxusSans-Light-BF659b6cb2036b5.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-eudoxus',
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: [{ name: seoConfig.author }],
  creator: seoConfig.creator,
  publisher: seoConfig.publisher,
  formatDetection: seoConfig.formatDetection,
  robots: seoConfig.robots,
  openGraph: {
    ...seoConfig.openGraph,
    images: [
      {
        url: seoConfig.images.ogImage,
        width: seoConfig.images.ogImageWidth,
        height: seoConfig.images.ogImageHeight,
        alt: seoConfig.images.ogImageAlt,
      },
    ],
  },
  twitter: {
    ...seoConfig.twitter,
    images: [`${seoConfig.siteUrl}${seoConfig.images.ogImage}`],
  },
  icons: {
    icon: [
      { url: seoConfig.favicons.icon16, sizes: '96x96', type: 'image/png' },
      { url: seoConfig.favicons.icon32, sizes: '96x96', type: 'image/png' },
    ],
    shortcut: seoConfig.favicons.shortcut,
    apple: seoConfig.favicons.appleTouch,
  },
  manifest: seoConfig.manifest,
  category: seoConfig.category,
  other: {
    'theme-color': seoConfig.themeColor,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // This prevents iOS zoom on focus
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${eudoxusSans.variable}`}>
      <body className={`${eudoxusSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
