/**
 * PDA (Program Derived Address) Helper Functions
 * 
 * This module provides functions to derive all PDAs used in the Workout POAP program.
 * PDAs are deterministic addresses derived from seeds, ensuring uniqueness and security.
 */

import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from './anchorClient';

/**
 * Derive the Config PDA
 * Seeds: ["config"]
 */
export function getConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        PROGRAM_ID
    );
}

/**
 * Derive an Admin PDA
 * Seeds: ["admin", admin_pubkey]
 */
export function getAdminPda(adminPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('admin'), adminPubkey.toBuffer()],
        PROGRAM_ID
    );
}

/**
 * Derive a Trainer PDA
 * Seeds: ["trainer", trainer_pubkey]
 */
export function getTrainerPda(trainerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('trainer'), trainerPubkey.toBuffer()],
        PROGRAM_ID
    );
}

/**
 * Derive a Schedule PDA
 * Seeds: ["schedule", schedule_id]
 */
export function getSchedulePda(scheduleId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('schedule'), Buffer.from(scheduleId)],
        PROGRAM_ID
    );
}

/**
 * Derive a WorkoutInstance PDA
 * Seeds: ["instance", trainer_pubkey, yyyymmdd (u32 LE), hour (u8), minute (u8)]
 */
export function getWorkoutInstancePda(
    trainerPubkey: PublicKey,
    yyyymmdd: number,
    hour: number,
    minute: number
): [PublicKey, number] {
    const yyyymmddBuf = Buffer.alloc(4);
    yyyymmddBuf.writeUInt32LE(yyyymmdd);

    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('instance'),
            trainerPubkey.toBuffer(),
            yyyymmddBuf,
            Buffer.from([hour]),
            Buffer.from([minute]),
        ],
        PROGRAM_ID
    );
}

/**
 * Derive an Attendance PDA
 * Seeds: ["attendance", instance_pubkey, user_pubkey]
 */
export function getAttendancePda(
    instancePubkey: PublicKey,
    userPubkey: PublicKey
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('attendance'),
            instancePubkey.toBuffer(),
            userPubkey.toBuffer(),
        ],
        PROGRAM_ID
    );
}

/**
 * Derive a MonthlyCounter PDA
 * Seeds: ["monthly", user_pubkey, yyyymm (u32 LE)]
 */
export function getMonthlyCounterPda(
    userPubkey: PublicKey,
    yyyymm: number
): [PublicKey, number] {
    const yyyymmBuf = Buffer.alloc(4);
    yyyymmBuf.writeUInt32LE(yyyymm);

    return PublicKey.findProgramAddressSync(
        [Buffer.from('monthly'), userPubkey.toBuffer(), yyyymmBuf],
        PROGRAM_ID
    );
}

/**
 * Derive Metaplex Metadata PDA for an NFT mint
 */
export function getMetadataPda(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
}

/**
 * Derive Metaplex Master Edition PDA for an NFT mint
 */
export function getMasterEditionPda(mint: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
}

