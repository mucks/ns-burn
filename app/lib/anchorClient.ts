/**
 * Anchor Client Utilities
 * 
 * This module provides helper functions to interact with the Workout POAP program.
 * It initializes the Anchor program instance and provides type-safe access to accounts.
 */

import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from './idl.json';

// Program ID - must match the declared ID in lib.rs
export const PROGRAM_ID = new PublicKey('7CLhdcpry5nkB1YmnzDnCrSHNiEmVsvSxdhB3LCReJAf');

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

// Sysvar Instructions Program ID
export const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey(
    'Sysvar1nstructions1111111111111111111111111'
);

/**
 * Get an Anchor program instance for the Workout POAP program
 * 
 * @param connection - Solana RPC connection
 * @param wallet - Connected wallet (optional for read-only operations)
 * @returns Anchor Program instance
 */
export function getProgram(connection: Connection, wallet?: AnchorWallet) {
    const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
    );

    return new Program(idl as Idl, PROGRAM_ID, provider);
}

/**
 * Helper to format error messages from Anchor errors
 */
export function formatProgramError(error: any): string {
    if (error.logs) {
        // Try to extract the program error from logs
        const errorLog = error.logs.find((log: string) =>
            log.includes('Error Message:') || log.includes('Error Code:')
        );
        if (errorLog) {
            return errorLog.replace('Program log: ', '');
        }
    }

    if (error.message) {
        return error.message;
    }

    return 'Unknown error occurred';
}

/**
 * Wait for transaction confirmation with better error handling
 */
export async function confirmTransaction(
    connection: Connection,
    signature: string,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
): Promise<void> {
    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction(
        {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        commitment
    );
}

