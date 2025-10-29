'use client';

import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import LeaderboardTable from '@/components/LeaderboardTable';
import { getProgram } from '@/lib/anchorClient';
import { getMonthlyCounterPda } from '@/lib/pdas';
import { dateToYyyymm, formatYyyymm } from '@/lib/time';

/**
 * Leaderboard Page
 * 
 * Displays monthly rankings of users by workout attendance count.
 * Allows selection of different months to view historical data.
 */
export default function LeaderboardPage() {
    const { connection } = useConnection();

    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [monthOptions, setMonthOptions] = useState<number[]>([]);
    const [leaderboardData, setLeaderboardData] = useState<
        Array<{ user: PublicKey; count: number }>
    >([]);
    const [loading, setLoading] = useState(true);

    // Initialize month options (current + past 6 months)
    useEffect(() => {
        const now = new Date();
        const months: number[] = [];

        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yyyymm = dateToYyyymm(date);
            months.push(yyyymm);
        }

        setMonthOptions(months);
        setSelectedMonth(months[0]); // Current month
    }, []);

    // Fetch leaderboard data for selected month
    useEffect(() => {
        if (!selectedMonth) return;

        const fetchLeaderboard = async () => {
            setLoading(true);

            try {
                const program = getProgram(connection);

                // In a production app, you'd use an indexer or maintain a registry of users.
                // For this demo, we'll fetch all MonthlyCounter accounts and filter by month.
                // This is a simplified approach; a real implementation would use getProgramAccounts
                // with filters or an off-chain indexer.

                const accounts = await program.account.monthlyCounter.all();

                // Filter by selected month and sort by count
                const filtered = accounts
                    .filter((acc: any) => acc.account.yyyymm === selectedMonth)
                    .map((acc: any) => ({
                        user: acc.account.user as PublicKey,
                        count: acc.account.count as number,
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10); // Top 10

                setLeaderboardData(filtered);
            } catch (error) {
                console.error('Fetch leaderboard error:', error);
                setLeaderboardData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedMonth, connection]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                    🏆 Leaderboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Top performers by monthly workout attendance
                </p>
            </div>

            {/* Month Selector */}
            <div className="card mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Select Month
                </label>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input"
                >
                    {monthOptions.map((yyyymm) => (
                        <option key={yyyymm} value={yyyymm}>
                            {formatYyyymm(yyyymm)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Leaderboard Table */}
            <LeaderboardTable entries={leaderboardData} loading={loading} />

            {/* Info Card */}
            <div className="card mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                    💡 About the Leaderboard
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Rankings are based on the number of workouts attended per month</li>
                    <li>• Each claimed NFT counts as one workout</li>
                    <li>• Leaderboard updates automatically when new NFTs are claimed</li>
                    <li>• Top 3 performers receive special recognition</li>
                    <li>• Keep attending workouts to climb the ranks!</li>
                </ul>
            </div>

            {/* Motivational Section */}
            {leaderboardData.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 dark:bg-opacity-20">
                        <div className="text-4xl mb-2">🥇</div>
                        <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                            {leaderboardData[0]?.count || 0}
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Top Score
                        </p>
                    </div>

                    <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 dark:bg-opacity-20">
                        <div className="text-4xl mb-2">📊</div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100">
                            {leaderboardData.length}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Active Users
                        </p>
                    </div>

                    <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 dark:bg-opacity-20">
                        <div className="text-4xl mb-2">🎯</div>
                        <h3 className="font-bold text-green-900 dark:text-green-100">
                            {leaderboardData.reduce((sum, e) => sum + e.count, 0)}
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Total Workouts
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

