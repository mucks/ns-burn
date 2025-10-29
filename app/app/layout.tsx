import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Workout POAP - Proof of Attendance Protocol',
    description: 'Mint unique NFTs for attending workouts via QR code claims',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Navigation />
                        <main className="flex-1 container mx-auto px-4 py-8">
                            {children}
                        </main>
                        <footer className="bg-gray-100 dark:bg-gray-900 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                            <p>Workout POAP © 2025 | Built on Solana</p>
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    );
}

