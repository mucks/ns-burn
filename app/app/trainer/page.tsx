'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';
import WalletGate from '@/components/WalletGate';
import QrDisplay from '@/components/QrDisplay';
import { getProgram, confirmTransaction, formatProgramError } from '@/lib/anchorClient';
import { getTrainerPda, getWorkoutInstancePda, getAdminPda } from '@/lib/pdas';
import { generateSecret, sha256, uint8ArrayToBase64 } from '@/lib/hash';
import { dateToYyyymmdd, getCurrentTimestamp, formatYyyymmdd, formatTime } from '@/lib/time';

/**
 * Trainer Console Page
 * 
 * Allows trainers to:
 * - Open workout instances
 * - Generate and display QR codes for attendees
 * - Close workout instances
 */
export default function TrainerPage() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [isTrainer, setIsTrainer] = useState(false);
    const [trainerName, setTrainerName] = useState('');
    const [loading, setLoading] = useState(true);

    // Workout instance form
    const [date, setDate] = useState('');
    const [hour, setHour] = useState('7');
    const [minute, setMinute] = useState('0');
    const [windowMinutes, setWindowMinutes] = useState('30');

    // Active instance
    const [activeInstance, setActiveInstance] = useState<{
        pubkey: string;
        qrData: string;
        yyyymmdd: number;
        hour: number;
        minute: number;
        windowEndTs: number;
    } | null>(null);

    const [opening, setOpening] = useState(false);
    const [closing, setClosing] = useState(false);

    // Check if wallet is a registered trainer
    useEffect(() => {
        if (!wallet.publicKey) {
            setLoading(false);
            return;
        }

        const checkTrainer = async () => {
            try {
                const program = getProgram(connection);
                const [trainerPda] = getTrainerPda(wallet.publicKey!);

                const trainerAccount = await program.account.trainer.fetch(trainerPda);
                setIsTrainer(true);
                setTrainerName(trainerAccount.displayName as string);
            } catch (error) {
                setIsTrainer(false);
            } finally {
                setLoading(false);
            }
        };

        checkTrainer();
    }, [wallet.publicKey, connection]);

    // Set default date to today
    useEffect(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
    }, []);

    /**
     * Open a new workout instance
     */
    const handleOpenInstance = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            toast.error('Please connect your wallet');
            return;
        }

        try {
            setOpening(true);

            // Parse date and time
            const selectedDate = new Date(date);
            const yyyymmdd = dateToYyyymmdd(selectedDate);
            const hourNum = parseInt(hour);
            const minuteNum = parseInt(minute);

            // Generate secret and hash
            const revealSecret = generateSecret();
            const secretHash = await sha256(revealSecret);

            // Calculate time window
            const now = getCurrentTimestamp();
            const windowStartTs = now - 60; // Allow claims starting 60s ago
            const windowEndTs = now + parseInt(windowMinutes) * 60;

            // Derive PDAs
            const program = getProgram(connection, wallet as any);
            const [trainerPda] = getTrainerPda(wallet.publicKey);
            const [instancePda] = getWorkoutInstancePda(
                wallet.publicKey,
                yyyymmdd,
                hourNum,
                minuteNum
            );

            // Try to derive admin PDA (optional)
            const [adminPda] = getAdminPda(wallet.publicKey);
            let adminAccount = null;
            try {
                await program.account.admin.fetch(adminPda);
                adminAccount = adminPda;
            } catch {
                // Not an admin, that's okay
            }

            toast.loading('Opening workout instance...', { id: 'open' });

            // Call open_workout_instance
            const tx = await program.methods
                .openWorkoutInstance(
                    yyyymmdd,
                    hourNum,
                    minuteNum,
                    { toNumber: () => windowStartTs } as any,
                    { toNumber: () => windowEndTs } as any,
                    Array.from(secretHash),
                    null
                )
                .accounts({
                    authority: wallet.publicKey,
                    admin: adminAccount,
                    trainer: trainerPda,
                    instance: instancePda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await confirmTransaction(connection, tx);

            toast.success('Workout instance opened!', { id: 'open' });

            // Create QR code URL (users scan this with their phone)
            const baseUrl = typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost:3000';
            const qrData = `${baseUrl}/claim?i=${instancePda.toBase58()}&s=${uint8ArrayToBase64(revealSecret)}`;

            setActiveInstance({
                pubkey: instancePda.toBase58(),
                qrData,
                yyyymmdd,
                hour: hourNum,
                minute: minuteNum,
                windowEndTs,
            });
        } catch (error: any) {
            console.error('Open instance error:', error);
            toast.error(formatProgramError(error), { id: 'open' });
        } finally {
            setOpening(false);
        }
    };

    /**
     * Close the active workout instance
     */
    const handleCloseInstance = async () => {
        if (!wallet.publicKey || !wallet.signTransaction || !activeInstance) {
            return;
        }

        try {
            setClosing(true);

            const program = getProgram(connection, wallet as any);
            const instancePubkey = new PublicKey(activeInstance.pubkey);
            const [trainerPda] = getTrainerPda(wallet.publicKey);

            // Try to derive admin PDA (optional)
            const [adminPda] = getAdminPda(wallet.publicKey);
            let adminAccount = null;
            try {
                await program.account.admin.fetch(adminPda);
                adminAccount = adminPda;
            } catch {
                // Not an admin
            }

            toast.loading('Closing workout instance...', { id: 'close' });

            const tx = await program.methods
                .closeWorkoutInstance()
                .accounts({
                    authority: wallet.publicKey,
                    admin: adminAccount,
                    trainer: trainerPda,
                    instance: instancePubkey,
                })
                .rpc();

            await confirmTransaction(connection, tx);

            toast.success('Workout instance closed!', { id: 'close' });
            setActiveInstance(null);
        } catch (error: any) {
            console.error('Close instance error:', error);
            toast.error(formatProgramError(error), { id: 'close' });
        } finally {
            setClosing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isTrainer) {
        return (
            <WalletGate message="Connect your wallet to access the trainer console">
                <div className="card max-w-md mx-auto text-center">
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
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                        Not a Registered Trainer
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your wallet is not registered as a trainer. Please contact an admin to get registered.
                    </p>
                </div>
            </WalletGate>
        );
    }

    return (
        <WalletGate>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                        Trainer Console
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome, <span className="font-semibold">{trainerName}</span>
                    </p>
                </div>

                {activeInstance ? (
                    /* Active Instance Display */
                    <div className="space-y-6">
                        <div className="card bg-green-50 dark:bg-green-900 dark:bg-opacity-20">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
                                    Workout Instance Active
                                </h2>
                                <p className="text-green-700 dark:text-green-300 mb-4">
                                    {formatYyyymmdd(activeInstance.yyyymmdd)} at{' '}
                                    {formatTime(activeInstance.hour, activeInstance.minute)}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Show this QR code to attendees after the workout
                                </p>
                            </div>
                        </div>

                        <div className="card text-center">
                            <QrDisplay
                                data={activeInstance.qrData}
                                size={400}
                                label="Scan this code to claim your workout NFT"
                            />
                        </div>

                        <div className="card">
                            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                                Instance Details
                            </h3>
                            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Instance Address:</span>
                                    <code className="font-mono">{activeInstance.pubkey.slice(0, 8)}...</code>
                                </div>
                                <div className="flex justify-between">
                                    <span>Window Closes:</span>
                                    <span>{new Date(activeInstance.windowEndTs * 1000).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleCloseInstance}
                                disabled={closing}
                                className="btn btn-secondary"
                            >
                                {closing ? 'Closing...' : 'Close Instance'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Open Instance Form */
                    <div className="card max-w-xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                            Open Workout Instance
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Hour (0-23)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={hour}
                                        onChange={(e) => setHour(e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Minute (0-59)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={minute}
                                        onChange={(e) => setMinute(e.target.value)}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Claim Window Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="120"
                                    value={windowMinutes}
                                    onChange={(e) => setWindowMinutes(e.target.value)}
                                    className="input"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    How long attendees can claim after the workout
                                </p>
                            </div>

                            <button
                                onClick={handleOpenInstance}
                                disabled={opening || !date}
                                className="btn btn-primary w-full"
                            >
                                {opening ? 'Opening...' : 'Open Instance & Generate QR'}
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                                💡 Instructions
                            </h3>
                            <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                                <li>1. Set the workout date and time</li>
                                <li>2. Click "Open Instance" before or during the workout</li>
                                <li>3. After the workout, show the generated QR code to attendees</li>
                                <li>4. Attendees scan and claim within the time window</li>
                                <li>5. Close the instance when done</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </WalletGate>
    );
}

