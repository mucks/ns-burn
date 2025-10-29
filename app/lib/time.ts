/**
 * Time Utility Functions
 * 
 * This module provides utilities for working with dates and times
 * in the YYYYMMDD and YYYYMM formats used by the program.
 */

/**
 * Convert a Date to YYYYMMDD format (as number)
 * Example: Oct 28, 2025 -> 20251028
 */
export function dateToYyyymmdd(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed
    const day = date.getDate();

    return year * 10000 + month * 100 + day;
}

/**
 * Convert YYYYMMDD number to Date
 * Example: 20251028 -> Oct 28, 2025
 */
export function yyyymmddToDate(yyyymmdd: number): Date {
    const year = Math.floor(yyyymmdd / 10000);
    const month = Math.floor((yyyymmdd % 10000) / 100) - 1; // 0-indexed
    const day = yyyymmdd % 100;

    return new Date(year, month, day);
}

/**
 * Convert a Date to YYYYMM format (as number)
 * Example: Oct 28, 2025 -> 202510
 */
export function dateToYyyymm(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-indexed

    return year * 100 + month;
}

/**
 * Convert YYYYMMDD to YYYYMM
 * Example: 20251028 -> 202510
 */
export function yyyymmddToYyyymm(yyyymmdd: number): number {
    return Math.floor(yyyymmdd / 100);
}

/**
 * Format YYYYMMDD as readable string
 * Example: 20251028 -> "2025-10-28"
 */
export function formatYyyymmdd(yyyymmdd: number): string {
    const year = Math.floor(yyyymmdd / 10000);
    const month = Math.floor((yyyymmdd % 10000) / 100);
    const day = yyyymmdd % 100;

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Format YYYYMM as readable string
 * Example: 202510 -> "October 2025"
 */
export function formatYyyymm(yyyymm: number): string {
    const year = Math.floor(yyyymm / 100);
    const month = yyyymm % 100;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${monthNames[month - 1]} ${year}`;
}

/**
 * Format hour and minute as readable string
 * Example: (7, 0) -> "07:00"
 */
export function formatTime(hour: number, minute: number): string {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Get current Unix timestamp (in seconds)
 */
export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * Convert Date to Unix timestamp (in seconds)
 */
export function dateToTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Unix timestamp to Date
 */
export function timestampToDate(timestamp: number): Date {
    return new Date(timestamp * 1000);
}

/**
 * Day of week names (0 = Sunday)
 */
export const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/**
 * Short day of week names (0 = Sunday)
 */
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format day of week
 * Example: 1 -> "Monday"
 */
export function formatDayOfWeek(dow: number): string {
    return DAY_NAMES[dow] || 'Unknown';
}

