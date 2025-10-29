'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import toast from 'react-hot-toast';
import WalletGate from '@/components/WalletGate';
import { getProgram, confirmTransaction, formatProgramError } from '@/lib/anchorClient';
import { getConfigPda, getAdminPda, getTrainerPda } from '@/lib/pdas';

/**
 * Admin Dashboard Page
 * 
 * Allows admins to:
 * - Add/remove admins
 * - Register trainers
 * - View system config
 */
export default function AdminPage() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Add admin form
    const [newAdminAddress, setNewAdminAddress] = useState('');
    const [addingAdmin, setAddingAdmin] = useState(false);

    // Register trainer form
    const [newTrainerAddress, setNewTrainerAddress] = useState('');
    const [newTrainerName, setNewTrainerName] = useState('');
    const [registeringTrainer, setRegisteringTrainer] = useState(false);

    // Check if wallet is an admin
    useEffect(() => {
        if (!wallet.publicKey) {
            setLoading(false);
            return;
        }

        const checkAdmin = async () => {
            try {
                const program = getProgram(connection);

                // Check if super admin
                const [configPda] = getConfigPda();
                const config = await program.account.config.fetch(configPda);
                if (config.authority.toBase58() === wallet.publicKey.toBase58()) {
                    setIsSuperAdmin(true);
                    setIsAdmin(true);
                    setLoading(false);
                    return;
                }

                // Check if regular admin
                const [adminPda] = getAdminPda(wallet.publicKey);
                await program.account.admin.fetch(adminPda);
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [wallet.publicKey, connection]);

    /**
     * Add a new admin
     */
    const handleAddAdmin = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            toast.error('Please connect your wallet');
            return;
        }

        if (!isSuperAdmin) {
            toast.error('Only the super admin can add admins');
            return;
        }

        try {
            setAddingAdmin(true);

            const newAdminPubkey = new PublicKey(newAdminAddress);
            const program = getProgram(connection, wallet as any);
            const [configPda] = getConfigPda();
            const [adminPda] = getAdminPda(newAdminPubkey);

            toast.loading('Adding admin...', { id: 'add-admin' });

            const tx = await program.methods
                .addAdmin()
                .accounts({
                    authority: wallet.publicKey,
                    config: configPda,
                    newAdmin: newAdminPubkey,
                    admin: adminPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await confirmTransaction(connection, tx);

            toast.success('Admin added successfully!', { id: 'add-admin' });
            setNewAdminAddress('');
        } catch (error: any) {
            console.error('Add admin error:', error);
            toast.error(formatProgramError(error), { id: 'add-admin' });
        } finally {
            setAddingAdmin(false);
        }
    };

    /**
     * Register a new trainer
     */
    const handleRegisterTrainer = async () => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            toast.error('Please connect your wallet');
            return;
        }

        try {
            setRegisteringTrainer(true);

            const trainerPubkey = new PublicKey(newTrainerAddress);
            const program = getProgram(connection, wallet as any);
            const [adminPda] = getAdminPda(wallet.publicKey);
            const [trainerPda] = getTrainerPda(trainerPubkey);

            toast.loading('Registering trainer...', { id: 'register-trainer' });

            const tx = await program.methods
                .registerTrainer(newTrainerName)
                .accounts({
                    adminAuthority: wallet.publicKey,
                    admin: adminPda,
                    trainerPubkey: trainerPubkey,
                    trainer: trainerPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            await confirmTransaction(connection, tx);

            toast.success('Trainer registered successfully!', { id: 'register-trainer' });
            setNewTrainerAddress('');
            setNewTrainerName('');
        } catch (error: any) {
            console.error('Register trainer error:', error);
            toast.error(formatProgramError(error), { id: 'register-trainer' });
        } finally {
            setRegisteringTrainer(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <WalletGate message="Connect your wallet to access the admin dashboard">
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
                        Admin Access Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your wallet does not have admin privileges.
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
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSuperAdmin && (
                            <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-semibold">
                                ⭐ Super Admin
                            </span>
                        )}
                        {!isSuperAdmin && (
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                                Admin
                            </span>
                        )}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Register Trainer */}
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Register Trainer
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Add a new trainer who can open workout instances and generate QR codes
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Trainer Wallet Address
                                </label>
                                <input
                                    type="text"
                                    value={newTrainerAddress}
                                    onChange={(e) => setNewTrainerAddress(e.target.value)}
                                    placeholder="Enter Solana public key"
                                    className="input"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={newTrainerName}
                                    onChange={(e) => setNewTrainerName(e.target.value)}
                                    placeholder="e.g., Coach Alex"
                                    className="input"
                                    maxLength={64}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    This name will appear in NFT metadata (max 64 characters)
                                </p>
                            </div>

                            <button
                                onClick={handleRegisterTrainer}
                                disabled={registeringTrainer || !newTrainerAddress || !newTrainerName}
                                className="btn btn-primary w-full"
                            >
                                {registeringTrainer ? 'Registering...' : 'Register Trainer'}
                            </button>
                        </div>
                    </div>

                    {/* Add Admin (Super Admin Only) */}
                    {isSuperAdmin && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Add Admin
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Grant admin privileges to another wallet (Super Admin only)
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Admin Wallet Address
                                    </label>
                                    <input
                                        type="text"
                                        value={newAdminAddress}
                                        onChange={(e) => setNewAdminAddress(e.target.value)}
                                        placeholder="Enter Solana public key"
                                        className="input"
                                    />
                                </div>

                                <button
                                    onClick={handleAddAdmin}
                                    disabled={addingAdmin || !newAdminAddress}
                                    className="btn btn-primary w-full"
                                >
                                    {addingAdmin ? 'Adding...' : 'Add Admin'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Quick Actions
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <a
                                href="/trainer"
                                className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                            >
                                <div className="text-2xl mb-2">🏋️</div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Trainer Console
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Open instances and generate QR codes
                                </p>
                            </a>

                            <a
                                href="/leaderboard"
                                className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                            >
                                <div className="text-2xl mb-2">🏆</div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Leaderboard
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    View top performers
                                </p>
                            </a>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="card bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20">
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                            💡 Admin Capabilities
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Register trainers who can open workout instances</li>
                            <li>• Open and close workout instances for any trainer</li>
                            {isSuperAdmin && <li>• Add or remove other admins (Super Admin only)</li>}
                            {isSuperAdmin && <li>• Update global configuration (Super Admin only)</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </WalletGate>
    );
}

