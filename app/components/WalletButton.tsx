'use client';

import dynamic from 'next/dynamic';

// Dynamically import WalletMultiButton with no SSR to prevent hydration errors
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

/**
 * Client-only Wallet Button Component
 * 
 * Wraps WalletMultiButton with dynamic import to prevent hydration errors.
 * Only renders on the client side.
 */
export default function WalletButton() {
    return <WalletMultiButtonDynamic className="!bg-primary-600 hover:!bg-primary-700" />;
}

