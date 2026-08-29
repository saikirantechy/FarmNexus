import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { FarmStoreProvider } from '@/lib/farm-store';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { FarmChatWidget } from '@/components/ai/FarmChatWidget';

export const metadata: Metadata = {
  title: 'FarmNexus — Know Your Farm. Know Your Money.',
  description:
    'Simple, multilingual, mobile-first Farm Business Operating System for farmers to track harvest, expenses, labour, sales, and net profit.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FarmNexus',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1e472d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#f8faf9]">
      <body className="h-full flex flex-col font-sans antialiased text-gray-900 bg-[#f8faf9]">
        <LanguageProvider>
          <FarmStoreProvider>
            <div className="flex-1 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 bottom-nav-spacer">
                {children}
              </main>
              <BottomNav />
              <FarmChatWidget />
            </div>
          </FarmStoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
