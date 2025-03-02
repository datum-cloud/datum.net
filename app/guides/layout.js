import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/app/layout.config';
import { guidesSource } from '@/libs/source';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';

import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <DocsLayout tree={guidesSource.pageTree} {...baseOptions}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
