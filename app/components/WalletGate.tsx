'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ReactNode } from 'react';

/**
 * WalletGate Component
 * 
 * Guards content that requires a connected wallet.
 * Shows a connect prompt if wallet is not connected.
 */
interface WalletGateProps {
    children: ReactNode;
    message?: string;
}

export default function WalletGate({
    children,
    message = 'Please connect your wallet to continue'
}: WalletGateProps) {
    const { connected } = useWallet();

    if (!connected) {
        return (
            <div className="card max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-primary-600 dark:text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Wallet Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700 mx-auto" />
            </div>
        );
    }

    return <>{children}</>;
}

