/**
 * Hash Utility Functions
 * 
 * This module provides utilities for generating and verifying SHA-256 hashes
 * used in the QR code secret verification system.
 */

/**
 * Generate a random secret (32 bytes)
 * This is used by trainers to create the reveal_secret for QR codes
 */
export function generateSecret(): Uint8Array {
    if (typeof window !== 'undefined' && window.crypto) {
        // Browser environment
        return window.crypto.getRandomValues(new Uint8Array(32));
    } else {
        // Node.js environment (for SSR)
        const crypto = require('crypto');
        return new Uint8Array(crypto.randomBytes(32));
    }
}

/**
 * Compute SHA-256 hash of data
 * Returns the hash as a Uint8Array (32 bytes)
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(hashBuffer);
    } else {
        // Node.js environment (for SSR)
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(Buffer.from(data)).digest();
        return new Uint8Array(hash);
    }
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(arr: Uint8Array): string {
    if (typeof window !== 'undefined') {
        // Browser environment
        return btoa(String.fromCharCode(...arr));
    } else {
        // Node.js environment
        return Buffer.from(arr).toString('base64');
    }
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    if (typeof window !== 'undefined') {
        // Browser environment
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } else {
        // Node.js environment
        return new Uint8Array(Buffer.from(base64, 'base64'));
    }
}

/**
 * Convert Uint8Array to hex string
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
    return Array.from(arr)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

/**
 * Verify that a secret matches a hash
 */
export async function verifySecret(
    secret: Uint8Array,
    expectedHash: Uint8Array
): Promise<boolean> {
    const actualHash = await sha256(secret);

    if (actualHash.length !== expectedHash.length) {
        return false;
    }

    for (let i = 0; i < actualHash.length; i++) {
        if (actualHash[i] !== expectedHash[i]) {
            return false;
        }
    }

    return true;
}

