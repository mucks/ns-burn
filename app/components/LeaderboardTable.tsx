'use client';

import { PublicKey } from '@solana/web3.js';

/**
 * LeaderboardTable Component
 * 
 * Displays a ranked list of users by their monthly workout count.
 * Shows abbreviated wallet addresses and claim counts.
 */
interface LeaderboardEntry {
    user: PublicKey;
    count: number;
}

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
    loading?: boolean;
}

export default function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
    /**
     * Abbreviate a public key for display
     * Example: 7xKX...9fGH
     */
    const abbreviateAddress = (pubkey: PublicKey): string => {
        const str = pubkey.toBase58();
        return `${str.slice(0, 4)}...${str.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="card">
                <div className="animate-pulse space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="card text-center py-12">
                <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    No workouts claimed for this month. Be the first!
                </p>
            </div>
        );
    }

    return (
        <div className="card overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Workouts
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {entries.map((entry, index) => {
                        // Medal icons for top 3
                        const getMedalIcon = (rank: number) => {
                            switch (rank) {
                                case 1:
                                    return '🥇';
                                case 2:
                                    return '🥈';
                                case 3:
                                    return '🥉';
                                default:
                                    return null;
                            }
                        };

                        const medal = getMedalIcon(index + 1);

                        return (
                            <tr
                                key={entry.user.toBase58()}
                                className={`${index < 3
                                        ? 'bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
                                        : ''
                                    }`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white mr-2">
                                            {medal || `#${index + 1}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-xs font-bold text-primary-700 dark:text-primary-200">
                                                {abbreviateAddress(entry.user).slice(0, 2)}
                                            </span>
                                        </div>
                                        <code className="text-sm text-gray-900 dark:text-white font-mono">
                                            {abbreviateAddress(entry.user)}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(entry.user.toBase58());
                                            }}
                                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            title="Copy full address"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span
                                        className={`text-sm font-bold ${index < 3
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        {entry.count}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

