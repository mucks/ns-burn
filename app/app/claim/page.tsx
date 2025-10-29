'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import WalletButton from '@/components/WalletButton';
import { getProgram, confirmTransaction, formatProgramError } from '@/lib/anchorClient';
import { getTrainerPda, getAttendancePda, getMonthlyCounterPda } from '@/lib/pdas';
import { base64ToUint8Array } from '@/lib/hash';
import { yyyymmddToYyyymm } from '@/lib/time';

/**
 * Claim Page
 * 
 * Users scan QR code with their phone and are redirected here.
 * The URL contains: ?i=instance_pubkey&s=reveal_secret
 * Automatically claims attendance when wallet is connected.
 */
export default function ClaimPage() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const searchParams = useSearchParams();

    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [claimedMint, setClaimedMint] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get params from URL
    const instanceParam = searchParams.get('i');
    const secretParam = searchParams.get('s');

    /**
     * Auto-claim NFT when wallet connects
     */
    useEffect(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !instanceParam || !secretParam || claimed || claiming) {
            return;
        }

        const claim = async () => {
            try {
                setClaiming(true);
                setError(null);

                // Parse params
                const instancePubkey = new PublicKey(instanceParam);
                const revealSecret = base64ToUint8Array(secretParam);

                toast.loading('Claiming your workout attendance...', { id: 'claim' });

                // Fetch instance data
                const program = getProgram(connection, wallet as any);
                const instanceAccount = await program.account.workoutInstance.fetch(instancePubkey);

                const trainerPubkey = instanceAccount.trainer as PublicKey;
                const yyyymmdd = instanceAccount.yyyymmdd as number;
                const yyyymm = yyyymmddToYyyymm(yyyymmdd);

                // Derive PDAs
                const [trainerPda] = getTrainerPda(trainerPubkey);
                const [attendancePda] = getAttendancePda(instancePubkey, wallet.publicKey);
                const [monthlyCounterPda] = getMonthlyCounterPda(wallet.publicKey, yyyymm);

                // Call claim_nft instruction (simplified - just records attendance)
                const tx = await program.methods
                    .claimNft(Array.from(revealSecret))
                    .accounts({
                        user: wallet.publicKey,
                        instance: instancePubkey,
                        trainer: trainerPda,
                        attendance: attendancePda,
                        monthlyCounter: monthlyCounterPda,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();

                await confirmTransaction(connection, tx);

                toast.success('Attendance claimed successfully!', { id: 'claim' });
                setClaimed(true);
                setClaimedMint(attendancePda.toBase58());
            } catch (error: any) {
                console.error('Claim error:', error);
                const errorMsg = formatProgramError(error);
                setError(errorMsg);
                toast.error(errorMsg, { id: 'claim' });
            } finally {
                setClaiming(false);
            }
        };

        claim();
    }, [wallet.publicKey, wallet.signTransaction, instanceParam, secretParam, connection, claimed, claiming]);

    // No params in URL
    if (!instanceParam || !secretParam) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                        Invalid Claim Link
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This page requires a valid QR code scan. Please scan the QR code displayed by your trainer.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        Make sure you're using the complete URL from the QR code.
                    </p>
                </div>
            </div>
        );
    }

    // Wallet not connected
    if (!wallet.publicKey) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card text-center">
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
                    <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                        Connect Your Wallet
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Connect your Solana wallet to claim your workout attendance
                    </p>
                    <div className="flex justify-center">
                        <WalletButton />
                    </div>
                </div>
            </div>
        );
    }

    // Successfully claimed
    if (claimed && claimedMint) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-green-200 dark:border-green-800 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-3 text-green-900 dark:text-green-100">
                        🎉 Attendance Claimed!
                    </h1>
                    <p className="text-green-700 dark:text-green-300 mb-6">
                        Your workout attendance has been recorded on-chain
                    </p>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Attendance Record:</div>
                        <div className="font-mono text-xs break-all text-gray-900 dark:text-gray-100">
                            {claimedMint}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href={`https://explorer.solana.com/address/${claimedMint}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary"
                        >
                            View on Explorer →
                        </a>
                        <a href="/leaderboard" className="btn-primary">
                            View Leaderboard
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Error occurred
    if (error) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border-red-200 dark:border-red-800 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-red-900 dark:text-red-100">
                        Claim Failed
                    </h1>
                    <p className="text-red-700 dark:text-red-300 mb-6">
                        {error}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-secondary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Claiming in progress
    return (
        <div className="max-w-2xl mx-auto">
            <div className="card text-center">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    Claiming Attendance...
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we record your workout attendance on-chain
                </p>
            </div>
        </div>
    );
}
